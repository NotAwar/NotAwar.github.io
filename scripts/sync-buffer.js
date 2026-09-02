const axios = require('axios');
const fs = require('fs');

/**
 * Buffer Posts Sync Script
 * Fetches recently published posts via Buffer's GraphQL API
 * (https://developers.buffer.com/) and updates src/data/generated-profile.json.
 * The legacy REST API (api.bufferapp.com/1) does not accept personal API keys
 * and is being retired, so this uses the GraphQL endpoint instead.
 * Source of truth: src/data/generated-profile.json (JSON only)
 */

const BUFFER_ACCESS_TOKEN = process.env.BUFFER_ACCESS_TOKEN;
// Optional: restrict the sync to a specific organization/set of channels.
// If omitted, the account's first organization and all of its channels are used.
const BUFFER_ORGANIZATION_ID = process.env.BUFFER_ORGANIZATION_ID || '';
const BUFFER_CHANNEL_IDS = (process.env.BUFFER_CHANNEL_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);
const BUFFER_API_URL = 'https://api.buffer.com';
const GENERATED_PROFILE_PATH = 'src/data/generated-profile.json';
const POSTS_PER_QUERY = 10;
const MAX_POSTS = 6;

function ensureGeneratedProfileDir() {
  const dir = GENERATED_PROFILE_PATH.split('/').slice(0, -1).join('/');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function bufferGraphQL(query, variables = {}) {
  const response = await axios.post(
    BUFFER_API_URL,
    { query, variables },
    {
      headers: {
        'Authorization': `Bearer ${BUFFER_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );

  if (response.data?.errors?.length) {
    throw new Error(response.data.errors.map((e) => e.message).join('; '));
  }
  return response.data.data;
}

async function fetchOrganizationId() {
  if (BUFFER_ORGANIZATION_ID) return BUFFER_ORGANIZATION_ID;

  console.log('🔄 Looking up Buffer organization...');
  const data = await bufferGraphQL(`
    query {
      account {
        id
        organizations {
          id
          name
        }
      }
    }
  `);

  const organizationId = data?.account?.organizations?.[0]?.id;
  if (!organizationId) {
    throw new Error('No Buffer organization found for this account.');
  }
  return organizationId;
}

async function fetchChannels(organizationId) {
  console.log('🔄 Fetching connected Buffer channels...');
  const data = await bufferGraphQL(
    `
    query ($input: ChannelsQueryInput!) {
      channels(input: $input) {
        id
        name
        service
      }
    }
  `,
    { input: { organizationId } }
  );

  const channels = Array.isArray(data?.channels) ? data.channels : [];
  if (BUFFER_CHANNEL_IDS.length > 0) {
    return channels.filter((channel) => BUFFER_CHANNEL_IDS.includes(channel.id));
  }
  return channels;
}

async function fetchSentPosts(organizationId, channelIds) {
  console.log('🔄 Fetching recently published posts...');
  const data = await bufferGraphQL(
    `
    query ($input: PostsQueryInput!, $first: Int!) {
      posts(first: $first, input: $input) {
        edges {
          node {
            id
            text
            sentAt
            externalLink
            channelId
          }
        }
      }
    }
  `,
    {
      first: POSTS_PER_QUERY,
      input: {
        organizationId,
        filter: {
          status: ['sent'],
          channelIds
        },
        sort: [{ field: 'createdAt', direction: 'desc' }]
      }
    }
  );

  const edges = Array.isArray(data?.posts?.edges) ? data.posts.edges : [];
  return edges.map((edge) => edge.node).filter(Boolean);
}

async function fetchBufferPosts() {
  if (!BUFFER_ACCESS_TOKEN) {
    console.log('⚠️  No BUFFER_ACCESS_TOKEN found. Using existing post data.');
    console.log('📝 To enable auto-sync, add BUFFER_ACCESS_TOKEN to GitHub Secrets.');
    console.log('   Get your API key at: https://publish.buffer.com/settings/api');
    return null;
  }

  try {
    const organizationId = await fetchOrganizationId();
    const channels = await fetchChannels(organizationId);
    if (channels.length === 0) {
      console.log('⚠️  No Buffer channels found for this organization.');
      return [];
    }

    const channelsById = new Map(channels.map((channel) => [channel.id, channel]));
    const posts = await fetchSentPosts(organizationId, channels.map((c) => c.id));

    const mappedPosts = posts
      .map((post) => ({
        id: String(post.id),
        text: (post.text || '').toString().slice(0, 350),
        url: post.externalLink || '',
        service: channelsById.get(post.channelId)?.service || '',
        published_at: post.sentAt ? new Date(post.sentAt).toISOString() : ''
      }))
      .filter((post) => post.text || post.url)
      .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0))
      .slice(0, MAX_POSTS);

    console.log(`✅ Fetched ${mappedPosts.length} recent post(s) from Buffer`);
    return mappedPosts;
  } catch (error) {
    console.error('❌ Error fetching Buffer posts:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return null;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Buffer posts sync...\n');

    let existingProfile = {};
    try {
      if (fs.existsSync(GENERATED_PROFILE_PATH)) {
        existingProfile = JSON.parse(fs.readFileSync(GENERATED_PROFILE_PATH, 'utf8'));
        console.log('📖 Loaded existing profile data');
      }
    } catch (error) {
      console.log('📝 No existing profile found, creating new one');
    }

    const bufferPosts = await fetchBufferPosts();

    if (bufferPosts !== null) {
      const updatedProfile = {
        ...existingProfile,
        buffer_posts: bufferPosts,
        metrics: {
          ...(existingProfile.metrics || {}),
          buffer_posts: bufferPosts.length
        },
        _last_synced_buffer: new Date().toISOString()
      };

      ensureGeneratedProfileDir();
      fs.writeFileSync(GENERATED_PROFILE_PATH, JSON.stringify(updatedProfile, null, 2), 'utf8');
      console.log('✅ Profile updated with Buffer posts!\n');
      console.log(`📅 Last synced: ${updatedProfile._last_synced_buffer}`);
    } else {
      console.log('\n⚠️  Skipping post update - using existing data');
      console.log('   To enable auto-sync:');
      console.log('   1. Get your API key at https://publish.buffer.com/settings/api');
      console.log('   2. Add it to GitHub Secrets as BUFFER_ACCESS_TOKEN');
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
