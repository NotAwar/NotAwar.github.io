const axios = require('axios');
const fs = require('fs');

/**
 * Buffer Posts Sync Script
 * Fetches recently published posts from Buffer (https://developers.buffer.com/)
 * and updates src/data/generated-profile.json.
 * Source of truth: src/data/generated-profile.json (JSON only)
 */

const BUFFER_ACCESS_TOKEN = process.env.BUFFER_ACCESS_TOKEN;
// Optional comma-separated list of Buffer profile ids to restrict the sync to.
// If omitted, every profile connected to the Buffer account is synced.
const BUFFER_PROFILE_IDS = (process.env.BUFFER_PROFILE_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);
const BUFFER_API_BASE = 'https://api.bufferapp.com/1';
const GENERATED_PROFILE_PATH = 'src/data/generated-profile.json';
const POSTS_PER_PROFILE = 10;
const MAX_POSTS = 6;

function ensureGeneratedProfileDir() {
  const dir = GENERATED_PROFILE_PATH.split('/').slice(0, -1).join('/');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function bufferGet(path, params = {}) {
  const response = await axios.get(`${BUFFER_API_BASE}${path}`, {
    params,
    headers: {
      'Authorization': `Bearer ${BUFFER_ACCESS_TOKEN}`
    },
    timeout: 30000
  });
  return response.data;
}

async function fetchProfiles() {
  console.log('🔄 Fetching connected Buffer profiles...');
  const profiles = await bufferGet('/profiles.json');
  if (!Array.isArray(profiles)) return [];

  if (BUFFER_PROFILE_IDS.length > 0) {
    return profiles.filter((profile) => BUFFER_PROFILE_IDS.includes(profile.id));
  }
  return profiles;
}

async function fetchSentUpdatesForProfile(profile) {
  try {
    const data = await bufferGet(`/profiles/${profile.id}/updates/sent.json`, {
      page: 1,
      count: POSTS_PER_PROFILE
    });
    const updates = Array.isArray(data?.updates) ? data.updates : [];
    return updates.map((update) => ({
      id: String(update.id),
      text: (update.text || '').toString().slice(0, 350),
      url: update.service_link || '',
      service: profile.service || update.profile_service || '',
      published_at: update.sent_at ? new Date(update.sent_at * 1000).toISOString() : ''
    }));
  } catch (error) {
    console.error(`❌ Error fetching sent updates for profile ${profile.id}:`, error.message);
    return [];
  }
}

async function fetchBufferPosts() {
  if (!BUFFER_ACCESS_TOKEN) {
    console.log('⚠️  No BUFFER_ACCESS_TOKEN found. Using existing post data.');
    console.log('📝 To enable auto-sync, add BUFFER_ACCESS_TOKEN to GitHub Secrets.');
    console.log('   Request API access at: https://developers.buffer.com/');
    return null;
  }

  try {
    const profiles = await fetchProfiles();
    if (profiles.length === 0) {
      console.log('⚠️  No Buffer profiles found for this account/token.');
      return [];
    }

    const postsPerProfile = await Promise.all(profiles.map(fetchSentUpdatesForProfile));
    const allPosts = postsPerProfile
      .flat()
      .filter((post) => post.text || post.url)
      .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0))
      .slice(0, MAX_POSTS);

    console.log(`✅ Fetched ${allPosts.length} recent post(s) from Buffer`);
    return allPosts;
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
      console.log('   1. Request API access at https://developers.buffer.com/');
      console.log('   2. Create an access token for your account');
      console.log('   3. Add it to GitHub Secrets as BUFFER_ACCESS_TOKEN');
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
