import { useEffect, useState } from "react";
import RadarRing from "./RadarRing.jsx";
import { fetchContributions, contributionTotal } from "../lib/github-contributions.js";

const TITLES = [
  "Cloud Native Architect",
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

// Visual number counts up via CSS (@property --num); real text stays for AT/crawlers
function StatValue({ value, suffix = "" }) {
  return (
    <strong>
      <span className="count-up" aria-hidden="true" style={{ "--to": value, "--suffix": `"${suffix}"` }} />
      <span className="sr-only">{`${value.toLocaleString("en-GB")}${suffix}`}</span>
    </strong>
  );
}

export default function NeonHero({
  name,
  headline,
  linkedinUrl,
  githubUrl,
  sessionizeUrl,
  metrics,
  avatarUrl,
}) {
  const githubUsername =
    githubUrl?.replace(/\/+$/, "").split("/").pop() || "NotAwar";

  // ── GitHub stats ──────────────────────────────────────────────────────
  // Snapshot/fallback values show a "+" until live numbers arrive
  const [stats, setStats] = useState(() => ({
    contributions: hasPositiveNumber(metrics?.github_contributions) ? metrics.github_contributions : 620,
    contributionsExact: false,
    repos: hasPositiveNumber(metrics?.github_repos) ? metrics.github_repos : 20,
    reposExact: hasPositiveNumber(metrics?.github_repos),
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
          if (alive) setStats((s) => ({ ...s, repos: data.public_repos, reposExact: true }));
          return;
        } catch {
          if (attempt < MAX_RETRIES - 1)
            await new Promise((r) => setTimeout(r, RETRY_DELAY * 2 ** attempt));
        }
      }
    })();

    return () => { alive = false; };
  }, [githubUsername, metrics]);

  useEffect(() => {
    if (hasPositiveNumber(metrics?.github_contributions)) return;
    let alive = true;

    fetchContributions(githubUsername)
      .then((data) => {
        const yearTotal = contributionTotal(data);
        if (alive && Number.isFinite(yearTotal) && yearTotal > 0) {
          setStats((s) => ({ ...s, contributions: yearTotal, contributionsExact: true }));
        }
      })
      .catch(() => {});

    return () => { alive = false; };
  }, [githubUsername, metrics]);

  // ── Typewriter ────────────────────────────────────────────────────────
  // Start fully typed so the server-rendered HTML contains a real title.
  const [tw, setTw] = useState({ idx: 0, chars: TITLES[0].length, deleting: false });
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAnimate(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!animate) return;
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
  }, [tw, animate]);

  const displayedTitle = TITLES[tw.idx].slice(0, tw.chars);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <section className="hero-grid hero-animated">
      <div className="hero-title-block">
        <h1 className="hero-title">{name}</h1>
        <p className="hero-subtitle">
          <span className="sr-only">{headline || TITLES[0]}</span>
          <span aria-hidden="true">
            {displayedTitle}
            {animate && <span className="tw-cursor">|</span>}
          </span>
        </p>
      </div>

      <div className="avatar-shell">
        <RadarRing size={200} />
        <img
          className="avatar-image"
          src={avatarUrl}
          alt={`${name} profile picture`}
          width="132"
          height="132"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div className="cta-row">
        <a className="btn neon" href={githubUrl} target="_blank" rel="noreferrer"
          title="Open GitHub profile in new tab" aria-label="GitHub profile">GitHub</a>
        <a className="btn" href={linkedinUrl} target="_blank" rel="noreferrer"
          title="Open LinkedIn profile in new tab" aria-label="LinkedIn profile">LinkedIn</a>
        <a className="btn" href={sessionizeUrl} target="_blank" rel="noreferrer"
          title="Open Sessionize profile in new tab" aria-label="Sessionize speaking profile">Sessionize</a>
      </div>

      <div className="stats-panel">
        <div className="stat-card">
          <span>Contributions</span>
          <StatValue value={stats.contributions} suffix={stats.contributionsExact ? "" : "+"} />
        </div>
        <div className="stat-card">
          <span>Public Repos</span>
          <StatValue value={stats.repos} suffix={stats.reposExact ? "" : "+"} />
        </div>
      </div>
    </section>
  );
}


