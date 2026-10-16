// Pure HTML builders shared by the build-time render and the client-side
// fallback, so both paths produce identical markup.

export type ContributionDay = { date: string; count: number; level?: number };

type GitHubEvent = any;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const DAY_LABEL_W = 30;
const MONTH_H = 18;
const LEVEL_COUNT = 5;

export const esc = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// ── Contribution graph ───────────────────────────────────────────────────

function buildWeeks(days: ContributionDay[]) {
  const weeks: (ContributionDay | null)[][] = [];
  const first = new Date(`${days[0]?.date}T00:00:00`);
  let week: (ContributionDay | null)[] = Array(first.getDay()).fill(null); // pad to Sunday
  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function monthLabels(weeks: (ContributionDay | null)[][]) {
  const seen = new Set<number>();
  const labels: { wi: number; label: string }[] = [];
  weeks.forEach((week, wi) => {
    for (const day of week) {
      if (!day) continue;
      const dt = new Date(`${day.date}T00:00:00`);
      if (dt.getDate() <= 7 && !seen.has(dt.getMonth())) {
        seen.add(dt.getMonth());
        labels.push({ wi, label: MONTHS[dt.getMonth()] });
      }
    }
  });
  return labels;
}

function cell(day: ContributionDay | null) {
  if (!day) return '<div class="cg-cell cg-empty"></div>';
  const level = Math.min(Math.max(Number(day.level) || 0, 0), LEVEL_COUNT - 1);
  const count = Number(day.count) || 0;
  const date = String(day.date).replace(/[^\d-]/g, "");
  return `<div class="cg-cell cg-l${level}" title="${count} contribution${count !== 1 ? "s" : ""} on ${date}"></div>`;
}

export function contributionGraphHTML(days: ContributionDay[], total: number) {
  const weeks = buildWeeks(days);
  const formatted = total.toLocaleString("en-GB");
  const months = monthLabels(weeks)
    .map(({ wi, label }) => `<span class="cg-month" style="left:calc(var(--stride) * ${wi})">${label}</span>`)
    .join("");
  const legend = Array.from({ length: LEVEL_COUNT }, (_, i) => `<div class="cg-cell cg-l${i}"></div>`).join("");

  return `<div class="cg-wrap">` +
    `<p class="cg-total"><strong><span class="count-up" aria-hidden="true" style="--to:${total}"></span><span class="sr-only">${formatted}</span></strong> contributions in the last year</p>` +
    `<div class="cg-scroll" role="img" aria-label="GitHub contribution calendar: ${formatted} contributions in the last year">` +
    `<div class="cg-inner" style="--weeks:${weeks.length}" aria-hidden="true">` +
    `<div class="cg-months" style="margin-left:${DAY_LABEL_W}px;height:${MONTH_H}px">${months}</div>` +
    `<div class="cg-body">` +
    `<div class="cg-day-labels">${DAY_LABELS.map((l) => `<span class="cg-day-label">${l}</span>`).join("")}</div>` +
    `<div class="cg-weeks">${weeks.map((week, wi) => `<div class="cg-week" style="--wi:${wi}">${week.map(cell).join("")}</div>`).join("")}</div>` +
    `</div></div></div>` +
    `<div class="cg-legend" aria-hidden="true"><span>Less</span>${legend}<span>More</span></div>` +
    `</div>`;
}

// ── Activity cards ───────────────────────────────────────────────────────
// The public Events API trims payloads (no commit messages or PR titles),
// so details are built from what remains: branch refs, numbers and tags.

const ICONS = {
  push: '<circle cx="12" cy="12" r="3.5"/><path d="M3 12h5.5M15.5 12H21"/>',
  pr: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M6 8.5v7M18 15.5V9a2 2 0 0 0-2-2h-4.5M13.5 4.5 11 7l2.5 2.5"/>',
  release: '<path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9z"/><circle cx="8" cy="8" r="1.5"/>',
  repo: '<path d="M6 3.5h12.5v14H7.5A2.5 2.5 0 0 0 5 20V5a1.5 1.5 0 0 1 1-1.5z"/><path d="M5 20a1.5 1.5 0 0 0 1.5 1.5h12v-4"/>',
  issue: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="1.5"/>',
};

const ARROW =
  '<svg viewBox="0 0 24 24" width="16" height="16" focusable="false" aria-hidden="true"><path fill="currentColor" d="M5 11h11.2l-4.6-4.6L13 5l7 7-7 7-1.4-1.4 4.6-4.6H5v-2Z"/></svg>';

const NEW_TAB = '<span class="sr-only"> (opens in a new tab)</span>';

type Activity = {
  key: string;
  icon: keyof typeof ICONS;
  text: string;
  repo: string;
  detail: string;
  href: string;
  cta: string;
};

const githubHref = (url: unknown, fallback: string) =>
  typeof url === "string" && url.startsWith("https://github.com/") ? url : fallback;

const branchOf = (ref = "") => ref.replace(/^refs\/(heads|tags)\//, "");

function icon(name: keyof typeof ICONS) {
  return `<svg class="activity-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">${ICONS[name]}</svg>`;
}

function describe(event: GitHubEvent, user: string): Activity | null {
  const fullName: string = event?.repo?.name ?? "";
  if (!fullName.includes("/")) return null;
  const [owner, name] = fullName.split("/");
  const repo = owner.toLowerCase() === user.toLowerCase() ? name : fullName;
  const repoUrl = `https://github.com/${fullName}`;
  const p = event.payload ?? {};

  switch (event.type) {
    case "PushEvent": {
      const branch = branchOf(p.ref);
      const message = p.commits?.[0]?.message?.split("\n")[0];
      return {
        key: `push:${fullName}`,
        icon: "push",
        text: "Pushed to",
        repo,
        detail: message || (branch ? `on ${branch}` : ""),
        href: branch ? `${repoUrl}/commits/${encodeURI(branch)}` : repoUrl,
        cta: "View commits",
      };
    }
    case "PullRequestEvent": {
      const pr = p.pull_request ?? {};
      const number = p.number ?? pr.number;
      const text =
        p.action === "opened" ? "Opened PR in" :
        p.action === "closed" && pr.merged ? "Merged PR in" : null;
      if (!text || !number) return null;
      return {
        key: `pr:${fullName}#${number}`,
        icon: "pr",
        text,
        repo,
        detail: pr.title ? `#${number} ${pr.title}` : `#${number}${pr.head?.ref ? ` from ${pr.head.ref}` : ""}`,
        href: githubHref(pr.html_url, `${repoUrl}/pull/${number}`),
        cta: "View PR",
      };
    }
    case "ReleaseEvent": {
      const tag = p.release?.tag_name;
      return {
        key: `release:${fullName}`,
        icon: "release",
        text: "Released",
        repo,
        detail: p.release?.name || tag || "",
        href: githubHref(p.release?.html_url, tag ? `${repoUrl}/releases/tag/${encodeURIComponent(tag)}` : `${repoUrl}/releases`),
        cta: "View release",
      };
    }
    case "CreateEvent":
      if (p.ref_type !== "repository") return null;
      return {
        key: `repo:${fullName}`,
        icon: "repo",
        text: "Created",
        repo,
        detail: p.description || "New repository",
        href: repoUrl,
        cta: "View repo",
      };
    case "IssuesEvent": {
      const number = p.issue?.number;
      if (p.action !== "opened" || !number) return null;
      return {
        key: `issue:${fullName}#${number}`,
        icon: "issue",
        text: "Opened issue in",
        repo,
        detail: p.issue?.title ? `#${number} ${p.issue.title}` : `#${number}`,
        href: githubHref(p.issue?.html_url, `${repoUrl}/issues/${number}`),
        cta: "View issue",
      };
    }
    default:
      return null;
  }
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export function timeAgo(iso: string, now = Date.now()) {
  const seconds = (new Date(iso).getTime() - now) / 1000;
  if (!Number.isFinite(seconds)) return null;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export function formatDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Oslo" });
}

// Build-time cards show the date; the client swaps in "2 days ago" so the
// static HTML never claims a relative time that has gone stale.
function card(item: Activity, createdAt: string | undefined, relative: boolean) {
  const absolute = createdAt ? formatDate(createdAt) : "";
  const label = createdAt && relative ? timeAgo(createdAt) ?? absolute : absolute;
  const time = createdAt
    ? `<time datetime="${esc(createdAt)}" title="${esc(absolute)}" data-relative>${esc(label)}</time>`
    : "";
  return `<a class="card nav-card fx-slide-in github-activity-card" href="${esc(item.href)}" target="_blank" rel="noreferrer">` +
    icon(item.icon) +
    `<p class="activity-action"><span class="activity-label">${esc(item.text)}</span> <span class="activity-repo">${esc(item.repo)}</span></p>` +
    (item.detail ? `<p class="activity-detail" title="${esc(item.detail)}">${esc(item.detail)}</p>` : "") +
    `<span class="activity-meta">${time}<span class="card-cta">${esc(item.cta)} ${ARROW}</span></span>` +
    NEW_TAB +
    `</a>`;
}

export function activityFallbackHTML(user: string, url: string) {
  return `<a class="card nav-card fx-slide-in github-activity-card" href="${esc(url)}" target="_blank" rel="noreferrer">` +
    icon("repo") +
    `<p class="activity-action"><span class="activity-repo">github.com/${esc(user)}</span></p>` +
    `<p class="activity-detail is-wrapped">Open-source work, conference demo repositories and contributions.</p>` +
    `<span class="card-cta">Open profile ${ARROW}</span>` +
    NEW_TAB +
    `</a>`;
}

// Newest first; one card per action/repo so a burst of pushes to the same
// repository doesn't crowd out everything else.
export function activityCardsHTML(events: GitHubEvent[], user: string, { relative = false, limit = 3 } = {}) {
  const seen = new Set<string>();
  const cards: string[] = [];
  for (const event of events) {
    const item = describe(event, user);
    if (!item || seen.has(item.key)) continue;
    seen.add(item.key);
    cards.push(card(item, event.created_at, relative));
    if (cards.length === limit) break;
  }
  return cards.join("");
}
