import fs from "node:fs";
import path from "node:path";

export type CredlyBadge = {
  id: string;
  name: string;
  issuer: string;
  issuer_url: string;
  category: string;
  level: string;
  issued_on: string;
  expires_on: string;
  image: string;
  url: string;
};

const dataPath = path.resolve(process.cwd(), "src", "data", "credly.json");

function loadBadges(): { profileUrl: string; badges: CredlyBadge[] } {
  try {
    const raw = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    return {
      profileUrl: raw.profile_url ?? "",
      badges: Array.isArray(raw.badges) ? raw.badges.filter((b: CredlyBadge) => b?.name) : [],
    };
  } catch {
    return { profileUrl: "", badges: [] };
  }
}

const data = loadBadges();
const today = new Date().toISOString().slice(0, 10);

export const credlyProfileUrl = data.profileUrl;
export const badges = data.badges;

export const isExpired = (badge: CredlyBadge) => Boolean(badge.expires_on) && badge.expires_on < today;
export const isCertification = (badge: CredlyBadge) => /certification/i.test(badge.category);

export const certifications = badges.filter(isCertification);
export const activeCertifications = certifications.filter((badge) => !isExpired(badge));
export const otherBadges = badges.filter((badge) => !isCertification(badge));

/** Short certification code, e.g. "KCSA: Kubernetes and ..." -> "KCSA". */
export function certificationCode(name: string): string | undefined {
  return name.match(/^([A-Z]{3,6}):/)?.[1] ?? name.match(/\(([A-Z]{2,6}\s?I{0,3})\)/)?.[1];
}

const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

export function formatMonth(date: string): string {
  return date ? monthFormat.format(new Date(`${date}T00:00:00Z`)) : "";
}
