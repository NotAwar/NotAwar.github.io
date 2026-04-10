import { useEffect, useState } from "react";

const defaultStats = {
  yearsExperience: "3+",
  contributions: "620+",
  repos: "45+",
};

const MAX_RETRIES = 2;
const RETRY_DELAY = 500; // ms

function hasPositiveNumber(value) {
  return typeof value === "number" && value > 0;
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

  const [stats, setStats] = useState(() => {
    // Initialize with metrics or defaults
    return {
      yearsExperience: hasPositiveNumber(metrics?.years_experience) ? `${metrics.years_experience}+` : defaultStats.yearsExperience,
      contributions: hasPositiveNumber(metrics?.github_contributions) ? `${metrics.github_contributions}+` : defaultStats.contributions,
      repos: hasPositiveNumber(metrics?.github_repos) ? `${metrics.github_repos}` : defaultStats.repos,
    };
  });

  useEffect(() => {
    let isMounted = true;

    const loadRepoCount = async () => {
      let lastError = null;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

          const response = await fetch(`https://api.github.com/users/${githubUsername}`, {
            signal: controller.signal,
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (!data || typeof data.public_repos !== "number") {
            throw new Error("Invalid GitHub API response format");
          }

          if (isMounted) {
            setStats((current) => ({
              ...current,
              repos: `${data.public_repos}`,
            }));
          }
          return; // Success
        } catch (error) {
          lastError = error;
          if (attempt < MAX_RETRIES - 1) {
            // Wait before retrying (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt))
            );
          }
        }
      }

      // All retries failed - log for debugging
      if (process.env.NODE_ENV === "development") {
        console.debug(
          "[NeonHero] Failed to fetch GitHub repos after " + MAX_RETRIES + " attempts:",
          lastError?.message
        );
      }
    };

    // Only fetch if we don't already have repo count in metrics
    if (!hasPositiveNumber(metrics?.github_repos)) {
      loadRepoCount();
    }

    return () => {
      isMounted = false;
    };
  }, [githubUsername, metrics]);

  return (
    <section className="hero-grid fx-slide-in hero-animated">
      <div>
        <h1 className="hero-title">{name}</h1>
        <h2 className="hero-subtitle" data-text={headline}>{headline}</h2>
        <div className="cta-row">
          <a
            className="btn neon"
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            title="Open GitHub profile in new tab"
            aria-label="GitHub profile"
          >
            GitHub
          </a>
          <a
            className="btn"
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            title="Open LinkedIn profile in new tab"
            aria-label="LinkedIn profile"
          >
            LinkedIn
          </a>
          <a
            className="btn"
            href={sessionizeUrl}
            target="_blank"
            rel="noreferrer"
            title="Open Sessionize profile in new tab"
            aria-label="Sessionize speaking profile"
          >
            Sessionize
          </a>
        </div>
      </div>
      <div className="stats-panel">
        <div className="avatar-shell">
          <div className="avatar-ring">
            <img className="avatar-image" src={avatarUrl} alt={`${name} profile picture`} />
          </div>
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

