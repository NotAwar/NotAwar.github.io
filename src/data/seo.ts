import { activeProfile } from "./site";
import { activeCertifications, credlyProfileUrl } from "./credly";

export const SITE_URL = (import.meta.env.SITE ?? "https://awar.no").replace(/\/+$/, "");
export const SITE_NAME = activeProfile.name;
export const SITE_LOCALE = "en_GB";
export const SITE_LANGUAGE = "en";
export const DEFAULT_OG_IMAGE = {
  path: "/og-image.jpg",
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: `${activeProfile.name} – ${activeProfile.title}`,
};
export const SITE_LOCATION = { locality: "Oslo", country: "NO", countryName: "Norway" };

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export type Breadcrumb = { name: string; path: string };
export type SchemaNode = Record<string, unknown>;

export function absoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, `${SITE_URL}/`).href;
}

const [givenName, ...rest] = activeProfile.name.split(" ");
const familyName = rest.join(" ");

export const githubUsername =
  activeProfile.contact.github.replace(/\/+$/, "").split("/").pop() ?? "NotAwar";

export const sameAs = Array.from(
  new Set(
    [activeProfile.contact.github, activeProfile.contact.linkedin, activeProfile.contact.sessionize, credlyProfileUrl]
      .filter(Boolean)
      .map((url) => url.replace(/\/+$/, "")),
  ),
);

export const currentRole = activeProfile.experience.find((job) => /present/i.test(job.period));

export const knowsAbout = Array.from(
  new Set([
    "Kubernetes",
    "Cloud Native",
    "Microsoft Azure",
    "Platform Engineering",
    "GitOps",
    "DevOps",
    ...activeProfile.skills.primary,
    ...activeProfile.skills.technical,
  ]),
);

export function personSchema(): SchemaNode {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: activeProfile.name,
    givenName,
    familyName,
    url: `${SITE_URL}/`,
    image: activeProfile.avatar_url ? { "@type": "ImageObject", url: activeProfile.avatar_url } : undefined,
    jobTitle: activeProfile.title,
    description: activeProfile.bio,
    worksFor: currentRole ? { "@type": "Organization", name: currentRole.company } : undefined,
    alumniOf: activeProfile.education.map((edu) => ({
      "@type": "CollegeOrUniversity",
      name: edu.school,
    })),
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_LOCATION.locality,
      addressCountry: SITE_LOCATION.country,
    },
    knowsAbout,
    knowsLanguage: ["en", "no"],
    hasCredential: activeCertifications.length
      ? activeCertifications.map((badge) => ({
          "@type": "EducationalOccupationalCredential",
          name: badge.name,
          credentialCategory: "certification",
          url: badge.url,
          dateCreated: badge.issued_on || undefined,
          expires: badge.expires_on || undefined,
          recognizedBy: badge.issuer ? { "@type": "Organization", name: badge.issuer } : undefined,
        }))
      : undefined,
    sameAs,
  };
}

export function websiteSchema(): SchemaNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: activeProfile.bio,
    inLanguage: SITE_LANGUAGE,
    publisher: { "@id": PERSON_ID },
    author: { "@id": PERSON_ID },
  };
}

export function breadcrumbSchema(pageUrl: string, items: Breadcrumb[]): SchemaNode {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function webPageSchema(options: {
  url: string;
  title: string;
  description: string;
  type?: string;
  image: string;
  breadcrumbs?: Breadcrumb[];
}): SchemaNode {
  const isProfile = options.type === "ProfilePage";
  return {
    "@type": options.type ?? "WebPage",
    "@id": `${options.url}#webpage`,
    url: options.url,
    name: options.title,
    description: options.description,
    inLanguage: SITE_LANGUAGE,
    isPartOf: { "@id": WEBSITE_ID },
    primaryImageOfPage: { "@type": "ImageObject", url: options.image },
    about: { "@id": PERSON_ID },
    mainEntity: isProfile ? { "@id": PERSON_ID } : undefined,
    breadcrumb: options.breadcrumbs?.length ? { "@id": `${options.url}#breadcrumb` } : undefined,
  };
}

/** Serialise JSON-LD safely for inline <script> output. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
