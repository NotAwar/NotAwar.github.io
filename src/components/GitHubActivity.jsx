import { useEffect, useState } from "react";

const EVENT_LABELS = {
  PushEvent: "Pushed to",
  PullRequestEvent: (e) =>
    e.payload?.action === "closed" && e.payload?.pull_request?.merged
      ? "Merged PR in"
      : e.payload?.action === "opened"
      ? "Opened PR in"
      : null,
  ReleaseEvent: "Released in",
  CreateEvent: (e) =>
    e.payload?.ref_type === "repository" ? "Created repo" : null,
  IssuesEvent: (e) =>
    e.payload?.action === "opened" ? "Opened issue in" : null,
};

function describeEvent(event) {
  const label = EVENT_LABELS[event.type];
  if (!label) return null;
  const text = typeof label === "function" ? label(event) : label;
  if (!text) return null;

  const repo = event.repo?.name?.replace(/^[^/]+\//, "") ?? event.repo?.name;
  const repoUrl = `https://github.com/${event.repo?.name}`;

  let detail = "";
  if (event.type === "PushEvent") {
    const commits = event.payload?.commits ?? [];
    detail = commits[0]?.message?.split("\n")[0] ?? "";
  } else if (event.type === "PullRequestEvent") {
    detail = event.payload?.pull_request?.title ?? "";
  } else if (event.type === "ReleaseEvent") {
    detail = event.payload?.release?.tag_name ?? "";
  } else if (event.type === "IssuesEvent") {
    detail = event.payload?.issue?.title ?? "";
  }

  return { text, repo, repoUrl, detail, created_at: event.created_at };
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

        const parsed = data
          .map(describeEvent)
          .filter(Boolean)
          .slice(0, 3);

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

  if (loading) {
    return (
      <div className="cards">
        {[0, 1, 2].map((i) => (
          <article key={i} className="card fx-slide-in github-activity-card loading-card">
            <div className="activity-skeleton" />
          </article>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="cards">
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          title="Open GitHub profile in new tab"
          aria-label="View GitHub profile"
        >
          <article className="card fx-slide-in github-activity-card">
            <p>View recent open-source work, projects, and contributions on GitHub.</p>
            <small>Open profile</small>
          </article>
        </a>
      </div>
    );
  }

  return (
    <div className="cards">
      {events.map((ev, i) => (
        <a
          key={i}
          href={ev.repoUrl}
          target="_blank"
          rel="noreferrer"
          title={`Open ${ev.repo} on GitHub in new tab`}
          aria-label={`View ${ev.repo} on GitHub`}
        >
          <article className="card fx-slide-in github-activity-card">
            <p className="activity-action">
              <span className="activity-label">{ev.text}</span>{" "}
              <span className="activity-repo">{ev.repo}</span>
            </p>
            {ev.detail && (
              <p className="activity-detail">{ev.detail}</p>
            )}
            <small>
              {ev.created_at
                ? new Date(ev.created_at).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent"}
            </small>
          </article>
        </a>
      ))}
    </div>
  );
}
