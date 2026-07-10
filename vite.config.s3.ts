// Static build config for S3 / CDN deployment.
// Uses Nitro's "static" preset — prerenders known routes and bundles the full
// React SPA so dynamic routes (/product/$id etc.) work client-side after load.
//
// Build:  npm run build:s3
// Output: .output/public/  ← upload this folder to S3
//
// S3 setup (one-time):
//   • Enable "Static website hosting" on the bucket
//   • Index document: index.html
//   • Error document: index.html   ← makes deep links work (SPA fallback)
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Skip Nitro/SSR entirely — pure Vite client SPA build.
  // Output: dist/client/   ← upload this folder to S3.
  nitro: false,
  tanstackStart: {
    server: { entry: "server" },
  },
});
