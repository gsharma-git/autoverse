/**
 * generate-sitemap.mjs
 * Queries Supabase for all published dealers, products, and services,
 * then writes a complete sitemap.xml to public/sitemap.xml.
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs
 *
 * Set these env vars (or add a .env.local):
 *   SUPABASE_URL=https://oyzqwwfjapuxxyawypez.supabase.co
 *   SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
 *   SITE_URL=https://autoverse.in   (optional, defaults below)
 */

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://oyzqwwfjapuxxyawypez.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SITE_URL = process.env.SITE_URL || "https://autoverse.in";

if (!SUPABASE_KEY) {
  console.error("Missing SUPABASE_PUBLISHABLE_KEY env var");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STATIC_PAGES = [
  { path: "/",           changefreq: "daily",   priority: "1.0" },
  { path: "/dealers",    changefreq: "daily",   priority: "0.9" },
  { path: "/tyres",      changefreq: "daily",   priority: "0.9" },
  { path: "/alloys",     changefreq: "daily",   priority: "0.9" },
  { path: "/services",   changefreq: "weekly",  priority: "0.8" },
  { path: "/membership", changefreq: "monthly", priority: "0.7" },
  { path: "/about",      changefreq: "monthly", priority: "0.5" },
  { path: "/contact",    changefreq: "monthly", priority: "0.5" },
];

function url(path, changefreq, priority) {
  return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generate() {
  console.log("Fetching dealers...");
  const { data: dealers, error: de } = await supabase
    .from("dealers")
    .select("id")
    .order("id");
  console.log("  dealers →", dealers?.length ?? "null", de ? `ERR: ${de.message}` : "");

  console.log("Fetching products...");
  const { data: products, error: pe } = await supabase
    .from("products")
    .select("id")
    .order("id");
  console.log("  products →", products?.length ?? "null", pe ? `ERR: ${pe.message}` : "");

  console.log("Fetching services...");
  const { data: services, error: se } = await supabase
    .from("services")
    .select("id")
    .order("id");
  console.log("  services →", services?.length ?? "null", se ? `ERR: ${se.message}` : "");

  const staticUrls = STATIC_PAGES.map((p) => url(p.path, p.changefreq, p.priority));

  const dealerUrls = (dealers ?? []).map((d) =>
    url(`/dealer/${d.id}`, "weekly", "0.8"),
  );

  const productUrls = (products ?? []).map((p) =>
    url(`/product/${p.id}`, "weekly", "0.7"),
  );

  const serviceUrls = (services ?? []).map((s) =>
    url(`/service/${s.id}`, "monthly", "0.6"),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Static pages -->
${staticUrls.join("\n")}

  <!-- Dealer pages (${dealerUrls.length}) -->
${dealerUrls.join("\n")}

  <!-- Product pages (${productUrls.length}) -->
${productUrls.join("\n")}

  <!-- Service pages (${serviceUrls.length}) -->
${serviceUrls.join("\n")}

</urlset>
`;

  const out = resolve(__dirname, "../public/sitemap.xml");
  writeFileSync(out, xml, "utf-8");

  console.log(`✓ Sitemap written to ${out}`);
  console.log(`  ${staticUrls.length} static + ${dealerUrls.length} dealers + ${productUrls.length} products + ${serviceUrls.length} services`);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
