const fs = require('fs');
const path = require('path');

/**
 * Credly Sync Script
 * Fetches public badges from the Credly profile JSON and writes
 * src/data/credly.json so certifications render as static, crawlable HTML
 * (with structured data) instead of ten third-party iframes.
 * If the request fails, the existing snapshot is kept untouched.
 */

const CREDLY_USERNAME = process.env.CREDLY_USERNAME || 'awar';
const CREDLY_BADGES_URL = `https://www.credly.com/users/${CREDLY_USERNAME}/badges.json`;
const OUTPUT_PATH = path.join('src', 'data', 'credly.json');
const MAX_PAGES = 10;

function clean(text) {
  return (text || '').toString().replace(/\s+/g, ' ').trim();
}

async function fetchPage(page) {
  const response = await fetch(`${CREDLY_BADGES_URL}?page=${page}&page_size=48`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function main() {
  console.log('🚀 Starting Credly sync...\n');

  const raw = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const json = await fetchPage(page);
      raw.push(...(Array.isArray(json?.data) ? json.data : []));
      if (!json?.metadata?.next_page_url) break;
    }
  } catch (error) {
    console.error('❌ Error fetching Credly badges:', error.message);
    console.log('⚠️  Keeping existing Credly snapshot');
    return;
  }

  const badges = raw
    .filter((badge) => badge?.public !== false && badge?.state === 'accepted' && badge?.badge_template?.name)
    .map((badge) => {
      const template = badge.badge_template;
      const issuer =
        badge.issuer?.entities?.find((entry) => entry.primary)?.entity ?? badge.issuer?.entities?.[0]?.entity ?? {};
      return {
        id: String(badge.id),
        name: clean(template.name),
        issuer: clean(issuer.name),
        issuer_url: issuer.vanity_url || '',
        category: clean(template.type_category) || 'Badge',
        level: clean(template.level),
        issued_on: (badge.issued_at_date || '').slice(0, 10),
        expires_on: (badge.expires_at_date || '').slice(0, 10),
        image: badge.image_url || template.image_url || '',
        url: `https://www.credly.com/badges/${badge.id}/public_url`,
      };
    })
    .sort((a, b) => b.issued_on.localeCompare(a.issued_on));

  if (!badges.length) {
    console.log('⚠️  No public badges returned, keeping existing Credly snapshot');
    return;
  }

  const snapshot = {
    profile_url: `https://www.credly.com/users/${CREDLY_USERNAME}`,
    badges,
  };

  const next = JSON.stringify(snapshot, null, 2) + '\n';
  const previous = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : '';
  if (next === previous) {
    console.log('✅ Credly data unchanged');
    return;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, next, 'utf8');
  console.log(`✅ Saved ${badges.length} badge(s) to ${OUTPUT_PATH}`);
}

main();
