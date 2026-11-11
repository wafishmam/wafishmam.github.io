// @ts-check
import { defineConfig } from "astro/config";

// User site (username.github.io) is served from the domain root, so no `base`.
// If you add a custom domain, change `site` and add public/CNAME.
export default defineConfig({
  site: "https://wafishmam.github.io",
  build: { inlineStylesheets: "always" },
  compressHTML: true,
});
