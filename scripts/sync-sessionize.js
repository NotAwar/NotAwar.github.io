const fs = require('fs');
const path = require('path');

/**
 * Sessionize Sync Script
 * Fetches public speaker data (sessions + events) from the Sessionize
 * speaker JSON API and writes src/data/sessionize.json so the speaking page
 * can be rendered as static, crawlable HTML instead of client-side embeds.
 * If the request fails, the existing snapshot is kept untouched.
 */

const SESSIONIZE_SPEAKER_ID = process.env.SESSIONIZE_SPEAKER_ID || '8zkgq232gg';
const SESSIONIZE_API_URL = `https://sessionize.com/api/speaker/json/${SESSIONIZE_SPEAKER_ID}`;
const OUTPUT_PATH = path.join('src', 'data', 'sessionize.json');

function clean(text) {
  return (text || '').toString().replace(/\r\n/g, '\n').trim();
}

function toDate(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

async function main() {
  console.log('🚀 Starting Sessionize sync...\n');

  let data;
  try {
    const response = await fetch(SESSIONIZE_API_URL, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
  } catch (error) {
    console.error('❌ Error fetching Sessionize data:', error.message);
    console.log('⚠️  Keeping existing Sessionize snapshot');
    return;
  }

  const speaker = data?.speaker ?? {};
  const sessions = (Array.isArray(data?.sessions) ? data.sessions : [])
    .map((session) => ({
      id: String(session.id),
      title: clean(session.title),
      description: clean(session.description),
      url: session.sessionUrl || '',
      language: session.language || '',
    }))
    .filter((session) => session.title);

  const events = (Array.isArray(data?.events) ? data.events : [])
    .map((event) => ({
      id: String(event.id),
      name: clean(event.name),
      start_date: toDate(event.eventStartDate),
      end_date: toDate(event.eventEndDate),
      location: clean(event.location),
      website: event.website || '',
    }))
    .filter((event) => event.name && event.start_date)
    .sort((a, b) => b.start_date.localeCompare(a.start_date));

  const snapshot = {
    speaker: {
      name: [speaker.firstName, speaker.lastName].filter(Boolean).join(' '),
      tagline: clean(speaker.tagline),
      bio: clean(speaker.bio),
      profile_url: speaker.speakerProfileUrl || '',
      photo_url: speaker.photoLargeUrl || speaker.photoUrl || '',
    },
    sessions,
    events,
  };

  const next = JSON.stringify(snapshot, null, 2) + '\n';
  const previous = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : '';
  if (next === previous) {
    console.log('✅ Sessionize data unchanged');
    return;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, next, 'utf8');
  console.log(`✅ Saved ${sessions.length} session(s) and ${events.length} event(s) to ${OUTPUT_PATH}`);
}

main();
