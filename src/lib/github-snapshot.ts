// Build-time GitHub data. The site rebuilds daily, so stats, the contribution
// graph and recent activity ship as static HTML: crawlable, no layout shift and
// no third-party requests from visitors. Each source falls back to null (and
// the components to a client-side fetch) if it can't be loaded.
import { contributionTotal } from "./github-contributions.js";
import type { ContributionDay } from "./github-render";

export interface GitHubSnapshot {
  repos: number | null;
  events: unknown[] | null;
  contributions: { days: ContributionDay[]; total: number } | null;
}

const TIMEOUT_MS = 10000;
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

async function getJSON(url: string, { auth = false } = {}) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "awar.no-build",
    };
    if (auth && TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
    const res = await fetch(url, { headers, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn(`[github-snapshot] ${url}: ${(error as Error).message}; falling back to client fetch`);
    return null;
  } finally {
    clearTimeout(tid);
  }
}

async function load(user: string): Promise<GitHubSnapshot> {
  const name = encodeURIComponent(user);
  const [profile, events, contributions] = await Promise.all([
    getJSON(`https://api.github.com/users/${name}`, { auth: true }),
    getJSON(`https://api.github.com/users/${name}/events/public?per_page=30`, { auth: true }),
    getJSON(`https://github-contributions-api.jogruber.de/v4/${name}?y=last`),
  ]);

  const days: ContributionDay[] = Array.isArray(contributions?.contributions) ? contributions.contributions : [];
  const total = contributionTotal(contributions);

  return {
    repos: typeof profile?.public_repos === "number" ? profile.public_repos : null,
    events: Array.isArray(events) ? events : null,
    contributions: days.length > 0 && total > 0 ? { days, total } : null,
  };
}

const cache = new Map<string, Promise<GitHubSnapshot>>();

export function getGitHubSnapshot(user: string) {
  if (!cache.has(user)) cache.set(user, load(user));
  return cache.get(user)!;
}
