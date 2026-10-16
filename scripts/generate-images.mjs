/**
 * Generates static social/share images and app icons into public/.
 *   - public/og-image.jpg        1200x630 Open Graph / Twitter card image (home)
 *   - public/og/*.jpg            1200x630 page-specific share cards
 *   - public/apple-touch-icon.png 180x180
 *   - public/icon-192.png, public/icon-512.png (web app manifest)
 *
 * Run with: npm run generate-images
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicDir = path.join(root, "public");
const profile = JSON.parse(
  await fs.readFile(path.join(root, "src", "data", "generated-profile.json"), "utf8"),
);

const COLORS = {
  bg: "#0f1117",
  glow: "#2a2414",
  text: "#f7f4e7",
  muted: "#cfc8b2",
  neon: "#f7efb8",
  neonAlt: "#efe2a2",
  cool: "#e7dba8",
  line: "#474233",
};
const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

const escapeXml = (value) =>
  String(value).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

function wrap(text, maxChars) {
  const lines = [];
  let current = "";
  for (const word of text.split(/\s+/)) {
    if ((current + " " + word).trim().length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function fetchAvatar(size) {
  const url = profile.avatar_url;
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const mask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
    );
    return sharp(buffer)
      .resize(size, size, { fit: "cover" })
      .composite([{ input: mask, blend: "dest-in" }])
      .png()
      .toBuffer();
  } catch (error) {
    console.warn(`⚠️  Could not fetch avatar (${error.message}); generating image without it.`);
    return null;
  }
}

async function renderOgCard(card, avatar) {
  const width = 1200;
  const height = 630;
  const avatarSize = 300;
  const cx = 930;
  const cy = 300;
  const { file, eyebrow, heading, lines, footnote, url } = card;
  const urlBox = Math.max(190, Math.round(url.length * 15.6 + 80));

  const ticks = Array.from({ length: 48 }, (_, i) => {
    const angle = (360 / 48) * i;
    return `<line x1="${cx}" y1="${cy - 196}" x2="${cx}" y2="${cy - 184}" transform="rotate(${angle} ${cx} ${cy})" />`;
  }).join("");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="glow" cx="0.18" cy="0.12" r="0.7">
      <stop offset="0" stop-color="${COLORS.glow}" />
      <stop offset="1" stop-color="${COLORS.bg}" />
    </radialGradient>
    <radialGradient id="orb" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${COLORS.neon}" stop-opacity="0.16" />
      <stop offset="1" stop-color="${COLORS.neon}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="name" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${COLORS.text}" />
      <stop offset="1" stop-color="${COLORS.neon}" />
    </linearGradient>
    <pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
      <line x1="0" y1="0" x2="0" y2="12" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#glow)" />
  <rect width="100%" height="100%" fill="url(#hatch)" />
  <circle cx="${cx}" cy="${cy}" r="280" fill="url(#orb)" />
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="28" fill="none" stroke="${COLORS.line}" stroke-width="3" />

  <text x="80" y="128" font-family="${FONT}" font-size="26" font-weight="700" letter-spacing="6" fill="${COLORS.neonAlt}">${escapeXml(eyebrow)}</text>
  <text x="80" y="232" font-family="${FONT}" font-size="78" font-weight="800" fill="url(#name)">${escapeXml(heading)}</text>
  ${lines
    .map(
      (line, i) =>
        `<text x="80" y="${300 + i * 46}" font-family="${FONT}" font-size="36" font-weight="600" fill="${COLORS.cool}">${escapeXml(line)}</text>`,
    )
    .join("")}
  <text x="80" y="${300 + lines.length * 46 + 40}" font-family="${FONT}" font-size="26" fill="${COLORS.muted}">${escapeXml(footnote.join("  ·  "))}</text>

  <rect x="80" y="500" width="${urlBox}" height="56" rx="12" fill="none" stroke="${COLORS.neon}" stroke-width="3" />
  <text x="${80 + urlBox / 2}" y="537" text-anchor="middle" font-family="${FONT}" font-size="28" font-weight="700" fill="${COLORS.neon}">${escapeXml(url)}</text>

  <g stroke="${COLORS.muted}" stroke-opacity="0.4" stroke-width="3">${ticks}</g>
  <circle cx="${cx}" cy="${cy}" r="172" fill="none" stroke="${COLORS.neon}" stroke-width="5" stroke-linecap="round" stroke-dasharray="240 841" transform="rotate(-60 ${cx} ${cy})" />
  <circle cx="${cx}" cy="${cy}" r="172" fill="none" stroke="${COLORS.cool}" stroke-width="4" stroke-linecap="round" stroke-dasharray="150 931" transform="rotate(120 ${cx} ${cy})" />
  <circle cx="${cx}" cy="${cy}" r="${avatarSize / 2 + 6}" fill="${COLORS.bg}" stroke="${COLORS.neon}" stroke-opacity="0.35" stroke-width="4" />
</svg>`;

  const layers = avatar ? [{ input: avatar, left: cx - avatarSize / 2, top: cy - avatarSize / 2 }] : [];
  const target = path.join(publicDir, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await sharp(Buffer.from(svg))
    .composite(layers)
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(target);
  console.log(`✅ public/${file}`);
}

// Page-specific share cards. Keep them evergreen (no counts), because they are
// generated locally rather than on every deploy. Alt texts live in src/data/seo.ts.
async function generateOgImages() {
  const title = profile.title || profile.headline || "Cloud Engineer";
  const titleLines = (title.includes(" & ")
    ? title.split(" & ").flatMap((part, i, parts) => wrap(i < parts.length - 1 ? `${part} &` : part, 34))
    : wrap(title, 30)
  ).slice(0, 2);

  const cards = [
    {
      file: "og-image.jpg",
      eyebrow: "AWAR//SYS",
      heading: profile.name,
      lines: titleLines,
      footnote: ["Kubernetes", "Azure", "GitOps", "Platform Engineering"],
      url: "awar.no",
    },
    {
      file: "og/speaking.jpg",
      eyebrow: "AWAR//SYS · SPEAKING",
      heading: "Speaking",
      lines: ["Conference talks on Kubernetes,", "GitOps & platform engineering"],
      footnote: ["GitOps", "GitHub at Scale", "Platform Teams", "MCP"],
      url: "awar.no/speaking",
    },
    {
      file: "og/cv.jpg",
      eyebrow: "AWAR//SYS · CV",
      heading: profile.name,
      lines: titleLines,
      footnote: ["Experience", "Skills", "Certifications"],
      url: "awar.no/cv",
    },
    {
      file: "og/socials.jpg",
      eyebrow: "AWAR//SYS · CONNECT",
      heading: "Let's Connect",
      lines: [`Find ${profile.name.split(" ")[0]} on GitHub,`, "LinkedIn & Sessionize"],
      footnote: ["Open source", "Networking", "Speaking invites"],
      url: "awar.no/socials",
    },
  ];

  const avatar = await fetchAvatar(300);
  for (const card of cards) await renderOgCard(card, avatar);
}

async function generateIcons() {
  const favicon = await fs.readFile(path.join(publicDir, "favicon.svg"));
  const targets = [
    ["apple-touch-icon.png", 180],
    ["icon-192.png", 192],
    ["icon-512.png", 512],
  ];
  for (const [file, size] of targets) {
    await sharp(favicon, { density: Math.ceil((72 * size) / 64) })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(path.join(publicDir, file));
    console.log(`✅ public/${file}`);
  }
}

await generateOgImages();
await generateIcons();
