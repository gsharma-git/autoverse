/**
 * Post-build script: generates dist/client/index.html for S3/SPA deployment.
 *
 * TanStack Start normally lets the SSR server produce the HTML shell.
 * When building for S3 (no server), we generate a static shell here by
 * reading the hashed asset filenames from dist/client/assets/.
 */

import { readdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, "dist", "client", "assets");

const files = readdirSync(assetsDir);

// Main entry: index-<hash>.js (but NOT the route-specific index files)
const mainJs = files.find((f) => /^index-[^.]+\.js$/.test(f));
const mainCss = files.find((f) => /^styles-[^.]+\.css$/.test(f));

if (!mainJs) {
  console.error("Could not find main entry JS in dist/client/assets/");
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My Tyres &amp; Alloys — India's Verified Tyre &amp; Alloy Marketplace</title>
    <meta name="description" content="Discover, compare and connect with verified tyre &amp; alloy dealers near you." />
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" />
    ${mainCss ? `<link rel="stylesheet" href="/assets/${mainCss}" />` : ""}
  </head>
  <body>
    <script type="module" src="/assets/${mainJs}"></script>
  </body>
</html>`;

const outPath = join(root, "dist", "client", "index.html");
writeFileSync(outPath, html);
console.log(`✓ Created dist/client/index.html`);
console.log(`  JS:  assets/${mainJs}`);
if (mainCss) console.log(`  CSS: assets/${mainCss}`);
