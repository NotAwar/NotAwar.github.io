import type { APIRoute } from "astro";
import { activeProfile } from "../data/site";
import { SITE_URL, SITE_LOCATION, absoluteUrl, sameAs } from "../data/seo";
import { speaking, eventCountries, formatEventDates } from "../data/speaking";

const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();

export const GET: APIRoute = () => {
  const p = activeProfile;
  const events = [...speaking.events].sort((a, b) => b.start_date.localeCompare(a.start_date));

  const lines = [
    `# ${p.name}`,
    "",
    `> ${oneLine(p.title)} based in ${SITE_LOCATION.locality}, ${SITE_LOCATION.countryName}. ${oneLine(p.bio)}`,
    "",
    oneLine(p.summary),
    "",
    "## Pages",
    "",
    `- [Home](${SITE_URL}/): Profile overview, current focus and GitHub activity`,
    `- [CV](${absoluteUrl("/cv/")}): Experience, education and technical skills`,
    `- [Speaking](${absoluteUrl("/speaking/")}): Conference talks, abstracts and events (${events.length} events in ${eventCountries.length} countries)`,
    `- [Socials](${absoluteUrl("/socials/")}): Recent posts and where to connect`,
    "",
    "## Experience",
    "",
    ...p.experience.map((job) => `- ${job.position}, ${job.company} (${job.period})`),
    "",
    "## Expertise",
    "",
    ...p.skills.primary.map((skill) => `- ${skill}`),
    "",
  ];

  if (speaking.sessions.length) {
    lines.push("## Talks", "", ...speaking.sessions.map((s) => `- ${oneLine(s.title)}`), "");
  }

  if (events.length) {
    lines.push(
      "## Conferences",
      "",
      ...events.map((e) => `- ${e.name}${e.location ? ` – ${e.location}` : ""} (${formatEventDates(e)})`),
      "",
    );
  }

  lines.push("## Profiles", "", ...sameAs.map((url) => `- ${url}`), "");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
