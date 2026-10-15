// Post-build SEO guardrail: validates every generated page in dist/.
// Errors fail the run; warnings are informational.
import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve("dist");
const errors = [];
const warnings = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith(".html") ? [full] : [];
  });
}

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1];
const metaContent = (html, key, value) =>
  [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]).find((tag) => attr(tag, key) === value);

if (!fs.existsSync(DIST)) {
  console.error("dist/ not found – run the build first");
  process.exit(1);
}

for (const file of ["robots.txt", "sitemap-index.xml", "llms.txt", "site.webmanifest", "og-image.jpg"]) {
  if (!fs.existsSync(path.join(DIST, file))) errors.push(`missing /${file}`);
}

const sitemapUrls = new Set(
  fs
    .readdirSync(DIST)
    .filter((name) => /^sitemap-\d+\.xml$/.test(name))
    .flatMap((name) => [...fs.readFileSync(path.join(DIST, name), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)])
    .map((m) => m[1]),
);

let checked = 0;
for (const file of walk(DIST)) {
  const html = fs.readFileSync(file, "utf8");
  const page = "/" + path.relative(DIST, file).replace(/\\/g, "/").replace(/index\.html$/, "");
  if (/<meta\s+http-equiv="refresh"/i.test(html)) continue;
  checked += 1;

  const fail = (msg) => errors.push(`${page}: ${msg}`);
  const warn = (msg) => warnings.push(`${page}: ${msg}`);

  const robots = attr(metaContent(html, "name", "robots") ?? "", "content") ?? "";
  const noindex = /noindex/i.test(robots);
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
  const description = attr(metaContent(html, "name", "description") ?? "", "content") ?? "";
  const canonical = attr(html.match(/<link\b[^>]*rel="canonical"[^>]*>/i)?.[0] ?? "", "href");
  const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;

  if (!/<html\b[^>]*\blang="/i.test(html)) fail("missing <html lang>");
  if (!title) fail("missing <title>");
  else if (title.length > 70) warn(`title is ${title.length} chars (may be truncated)`);
  if (!description) fail("missing meta description");
  else if (description.length < 50 || description.length > 200) warn(`description is ${description.length} chars`);
  if (h1Count !== 1) fail(`expected exactly one <h1>, found ${h1Count}`);

  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (!/\salt="/i.test(tag)) fail(`<img> without alt: ${tag.slice(0, 80)}…`);
  }

  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(json);
    } catch (error) {
      fail(`invalid JSON-LD: ${error.message}`);
    }
  }

  if (!noindex) {
    if (!canonical?.startsWith("https://")) fail("missing absolute canonical URL");
    if (!metaContent(html, "property", "og:image")) fail("missing og:image");
    if (canonical && !sitemapUrls.has(canonical)) fail(`canonical ${canonical} is not in the sitemap`);
  } else if (canonical && sitemapUrls.has(canonical)) {
    fail("noindex page is listed in the sitemap");
  }
}

warnings.forEach((msg) => console.warn(`⚠️  ${msg}`));
errors.forEach((msg) => console.error(`❌ ${msg}`));
console.log(`\nChecked ${checked} page(s) and ${sitemapUrls.size} sitemap URL(s): ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
