import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

const site = "https://awar.no";
const redirects = { "/resume": "/cv/" };
const excludedFromSitemap = new Set(
  [...Object.keys(redirects), "/404"].map((path) => `${site}${path.replace(/\/?$/, "/")}`),
);

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "always",
  redirects,
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Orbitron",
      cssVariable: "--font-orbitron",
      weights: ["400 900"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["system-ui", "sans-serif"],
      display: "swap",
    },
  ],
  integrations: [
    react(),
    sitemap({
      filter: (page) => !excludedFromSitemap.has(page),
    }),
  ],
});

