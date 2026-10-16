// Shared, memoised loader so the hero stats and the contribution graph
// make a single request to the contributions API per page view.
const API = "https://github-contributions-api.jogruber.de/v4";
const TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

const cache = new Map();

async function request(username) {
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${API}/${encodeURIComponent(username)}?y=last`, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data?.contributions)) throw new Error("bad format");
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * 2 ** attempt));
      }
    } finally {
      clearTimeout(tid);
    }
  }
  throw lastError;
}

export function fetchContributions(username) {
  if (!cache.has(username)) {
    const promise = request(username).catch((error) => {
      cache.delete(username);
      throw error;
    });
    cache.set(username, promise);
  }
  return cache.get(username);
}

export function contributionTotal(data) {
  return Object.values(data?.total ?? {}).reduce(
    (sum, value) => sum + (typeof value === "number" ? value : 0),
    0,
  );
}
