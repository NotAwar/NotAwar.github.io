import { useEffect, useState } from "react";

const TITLES = [
  "Senior Cloud Engineer",
  "Cloud Native Competency Lead",
  "Platform Engineer",
  "Kubernetes & Azure Specialist",
  "Tech Speaker",
];

const TYPE_MS    = 75;
const DELETE_MS  = 38;
const PAUSE_END  = 1800;
const PAUSE_START = 350;
const MAX_RETRIES = 2;
const RETRY_DELAY = 500;

function hasPositiveNumber(v) {
  return typeof v === "number" && v > 0;
}

export default function NeonHero({
  name,
  linkedinUrl,
  githubUrl,
  sessionizeUrl,
  metrics,
  avatarUrl,
}) {
  const githubUsername =
    githubUrl?.replace(/\/+$/, "").split("/").pop() || "NotAwar";

  // ── GitHub stats ──────────────────────────────────────────────────────
  const [stats, setStats] = useState(() => ({
    contributions: hasPositiveNumber(metrics?.github_contributions)
      ? `${metrics.github_contributions}+`
      : "620+",
    repos: hasPositiveNumber(metrics?.github_repos)
      ? `${metrics.github_repos}`
      : "45+",
  }));

  useEffect(() => {
    if (hasPositiveNumber(metrics?.github_repos)) return;
    let alive = true;

    (async () => {
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const ctrl = new AbortController();
          const tid  = setTimeout(() => ctrl.abort(), 8000);
          const res  = await fetch(`https://api.github.com/users/${githubUsername}`, {
            signal: ctrl.signal,
            headers: { Accept: "application/vnd.github.v3+json" },
          });
          clearTimeout(tid);
          if (!res.ok) throw new Error(`${res.status}`);
          const data = await res.json();
          if (typeof data.public_repos !== "number") throw new Error("bad format");
          if (alive) setStats((s) => ({ ...s, repos: `${data.public_repos}` }));
          return;
        } catch {
          if (attempt < MAX_RETRIES - 1)
            await new Promise((r) => setTimeout(r, RETRY_DELAY * 2 ** attempt));
        }
      }
    })();

    return () => { alive = false; };
  }, [githubUsername, metrics]);

  // ── Typewriter ────────────────────────────────────────────────────────
  const [tw, setTw] = useState({ idx: 0, chars: 0, deleting: false });

  useEffect(() => {
    const target = TITLES[tw.idx];
    const ms =
      !tw.deleting && tw.chars === target.length ? PAUSE_END :
      tw.deleting  && tw.chars === 0             ? PAUSE_START :
      tw.deleting                                ? DELETE_MS : TYPE_MS;

    const tid = setTimeout(() => {
      setTw((prev) => {
        const t = TITLES[prev.idx];
        if (!prev.deleting && prev.chars < t.length)  return { ...prev, chars: prev.chars + 1 };
        if (!prev.deleting && prev.chars === t.length) return { ...prev, deleting: true };
        if (prev.deleting  && prev.chars > 0)          return { ...prev, chars: prev.chars - 1 };
        return { idx: (prev.idx + 1) % TITLES.length, chars: 0, deleting: false };
      });
    }, ms);

    return () => clearTimeout(tid);
  }, [tw]);

  const displayedTitle = TITLES[tw.idx].slice(0, tw.chars);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <section className="hero-grid fx-slide-in hero-animated">
      <div>
        <h1 className="hero-title">{name}</h1>
        <h2 className="hero-subtitle">
          {displayedTitle}
          <span className="tw-cursor" aria-hidden="true">|</span>
        </h2>
        <div className="cta-row">
          <a className="btn neon" href={githubUrl} target="_blank" rel="noreferrer"
            title="Open GitHub profile in new tab" aria-label="GitHub profile">GitHub</a>
          <a className="btn" href={linkedinUrl} target="_blank" rel="noreferrer"
            title="Open LinkedIn profile in new tab" aria-label="LinkedIn profile">LinkedIn</a>
          <a className="btn" href={sessionizeUrl} target="_blank" rel="noreferrer"
            title="Open Sessionize profile in new tab" aria-label="Sessionize speaking profile">Sessionize</a>
        </div>
      </div>

      <div className="stats-panel">
        <div className="avatar-shell">
          <img
            className="avatar-image"
            src={avatarUrl}
            alt={`${name} profile picture`}
            width="132"
            height="132"
          />
        </div>
        <div className="stat-card">
          <span>Contributions</span>
          <strong>{stats.contributions}</strong>
        </div>
        <div className="stat-card">
          <span>Repos</span>
          <strong>{stats.repos}</strong>
        </div>
      </div>
    </section>
  );
}


