import fs from "node:fs";
import path from "node:path";

export type SpeakingSession = {
  id: string;
  title: string;
  description: string;
  url: string;
  language?: string;
};

export type SpeakingEvent = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  website: string;
};

export type SpeakingData = {
  sessions: SpeakingSession[];
  events: SpeakingEvent[];
};

const dataPath = path.resolve(process.cwd(), "src", "data", "sessionize.json");

function loadSpeakingData(): SpeakingData {
  try {
    const raw = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    return {
      sessions: Array.isArray(raw.sessions) ? raw.sessions.filter((s: SpeakingSession) => s?.title) : [],
      events: Array.isArray(raw.events) ? raw.events.filter((e: SpeakingEvent) => e?.name && e?.start_date) : [],
    };
  } catch {
    return { sessions: [], events: [] };
  }
}

export const speaking = loadSpeakingData();

const today = new Date().toISOString().slice(0, 10);

export const upcomingEvents = speaking.events
  .filter((event) => (event.end_date || event.start_date) >= today)
  .sort((a, b) => a.start_date.localeCompare(b.start_date));

export const pastEvents = speaking.events
  .filter((event) => (event.end_date || event.start_date) < today)
  .sort((a, b) => b.start_date.localeCompare(a.start_date));

export const eventCountries = Array.from(
  new Set(
    speaking.events
      .map((event) => event.location.split(",").pop()?.trim() ?? "")
      .filter(Boolean),
  ),
);

/** Event name without a trailing year, e.g. "ContainerDays Hamburg 2026" -> "ContainerDays Hamburg". */
export function eventShortName(name: string): string {
  return name.replace(/\s+(19|20)\d{2}$/, "").trim();
}

const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "UTC" });
const fullFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatEventDates(event: SpeakingEvent): string {
  const start = new Date(`${event.start_date}T00:00:00Z`);
  const end = event.end_date ? new Date(`${event.end_date}T00:00:00Z`) : start;
  if (event.end_date === event.start_date || !event.end_date) return fullFormat.format(start);
  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth();
  return sameMonth
    ? `${dayFormat.format(start)}–${fullFormat.format(end)}`
    : `${fullFormat.format(start)} – ${fullFormat.format(end)}`;
}

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}
