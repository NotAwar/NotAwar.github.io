import { useEffect, useState } from "react";

// The public Events API trims payloads (no commit messages or PR titles),
// so details are built from what remains: branch refs, numbers and tags.
const ICONS = {
  push: (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M3 12h5.5M15.5 12H21" />
    </>
  ),
  pr: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M6 8.5v7M18 15.5V9a2 2 0 0 0-2-2h-4.5M13.5 4.5 11 7l2.5 2.5" />
    </>
  ),
  release: (
    <>
      <path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9z" />
      <circle cx="8" cy="8" r="1.5" />
    </>
  ),
  repo: (
    <>
      <path d="M6 3.5h12.5v14H7.5A2.5 2.5 0 0 0 5 20V5a1.5 1.5 0 0 1 1-1.5z" />
      <path d="M5 20a1.5 1.5 0 0 0 1.5 1.5h12v-4" />
    </>
  ),
  issue: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
};

const ARROW = (
  <svg viewBox="0 0 24 24" width="16" height="16" focusable="false" aria-hidden="true">
    <path fill="currentColor" d="M5 11h11.2l-4.6-4.6L13 5l7 7-7 7-1.4-1.4 4.6-4.6H5v-2Z" />
  </svg>
);

const branchOf = (ref = "") => ref.replace(/^refs\/(heads|tags)\//, "");

function describeEvent(event, username) {
  const fullName = event.repo?.name ?? "";
  const [owner, name] = fullName.split("/");
  const repo = owner?.toLowerCase() === username.toLowerCase() ? name : fullName;
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
        href: pr.html_url || `${repoUrl}/pull/${number}`,
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
        href: p.release?.html_url || (tag ? `${repoUrl}/releases/tag/${encodeURIComponent(tag)}` : `${repoUrl}/releases`),
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
        href: p.issue?.html_url || `${repoUrl}/issues/${number}`,
        cta: "View issue",
      };
    }
    default:
      return null;
  }
}

const UNITS = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

function timeAgo(iso) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  if (!Number.isFinite(seconds)) return "Recently";
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

function ActivityIcon({ name }) {
  return (
    <svg
      className="activity-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

export default function GitHubActivity({ githubUrl }) {
  const username =
    githubUrl?.replace(/\/+$/, "").split("/").pop() || "NotAwar";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(
          `https://api.github.com/users/${username}/events/public?per_page=30`,
          {
            signal: controller.signal,
            headers: { Accept: "application/vnd.github.v3+json" },
          }
        );
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const data = await res.json();

        // Newest first; keep one card per action/repo so a burst of pushes
        // to the same repository doesn't crowd out everything else.
        const seen = new Set();
        const parsed = [];
        for (const event of data) {
          const item = describeEvent(event, username);
          if (!item || seen.has(item.key)) continue;
          seen.add(item.key);
          parsed.push({ ...item, createdAt: event.created_at });
          if (parsed.length === 3) break;
        }

        if (isMounted) {
          setEvents(parsed);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [username]);

  // Distinct keys per state so React mounts fresh nodes (the reveal script
  // observes added nodes and owns their is-visible class).
  if (loading) {
    return (
      <div className="cards" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={`skeleton-${i}`} className="card github-activity-card loading-card" aria-hidden="true">
            <div className="activity-skeleton" />
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="cards">
        <a
          key="fallback"
          className="card nav-card fx-slide-in github-activity-card"
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
        >
          <ActivityIcon name="repo" />
          <p className="activity-action">
            <span className="activity-repo">github.com/{username}</span>
          </p>
          <p className="activity-detail is-wrapped">
            Open-source work, conference demo repositories and contributions.
          </p>
          <span className="card-cta">Open profile {ARROW}</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    );
  }

  return (
    <div className="cards">
      {events.map((ev) => (
        <a
          key={ev.key}
          className="card nav-card fx-slide-in github-activity-card"
          href={ev.href}
          target="_blank"
          rel="noreferrer"
        >
          <ActivityIcon name={ev.icon} />
          <p className="activity-action">
            <span className="activity-label">{ev.text}</span>{" "}
            <span className="activity-repo">{ev.repo}</span>
          </p>
          {ev.detail && <p className="activity-detail" title={ev.detail}>{ev.detail}</p>}
          <span className="activity-meta">
            {ev.createdAt && (
              <time dateTime={ev.createdAt} title={new Date(ev.createdAt).toLocaleString()}>
                {timeAgo(ev.createdAt)}
              </time>
            )}
            <span className="card-cta">{ev.cta} {ARROW}</span>
          </span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ))}
    </div>
  );
}