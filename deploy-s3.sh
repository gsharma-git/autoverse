#!/usr/bin/env bash
# AutoMarketplace — S3 static deploy script
#
# Prerequisites:
#   1. AWS CLI installed and configured (aws configure)
#   2. S3 bucket created with static website hosting enabled:
#        Index document: index.html
#        Error document: index.html   ← critical for SPA deep-links
#   3. Bucket policy allowing public read (see BUCKET_POLICY below)
#   4. VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set in .env.production
#
# Usage:
#   chmod +x deploy-s3.sh
#   S3_BUCKET=your-bucket-name ./deploy-s3.sh
#
# Optional — serve via CloudFront for HTTPS + faster global delivery:
#   CLOUDFRONT_DIST_ID=EXXXXXXX ./deploy-s3.sh

set -euo pipefail

BUCKET="${S3_BUCKET:?Set S3_BUCKET env var, e.g. S3_BUCKET=automarketplace-prod}"
DIST_DIR=".output/public"
REGION="${AWS_REGION:-ap-south-1}"   # Mumbai — change if needed

echo "▶ Building static SPA…"
npm run build:s3

echo "▶ Syncing to s3://$BUCKET …"

# Upload immutable hashed assets with long cache (1 year)
aws s3 sync "$DIST_DIR" "s3://$BUCKET" \
  --region "$REGION" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.json"

# Upload HTML + JSON with no-cache so deploys are instant
aws s3 sync "$DIST_DIR" "s3://$BUCKET" \
  --region "$REGION" \
  --cache-control "public, no-cache, must-revalidate" \
  --include "*.html" \
  --include "*.json"

echo "✓ Deploy complete → http://$BUCKET.s3-website.$REGION.amazonaws.com"

# Optional CloudFront invalidation (clears CDN cache after deploy)
if [[ -n "${CLOUDFRONT_DIST_ID:-}" ]]; then
  echo "▶ Invalidating CloudFront distribution $CLOUDFRONT_DIST_ID …"
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DIST_ID" \
    --paths "/*"
  echo "✓ Invalidation submitted"
fi

cat <<'MSG'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUCKET POLICY (public read) — paste into S3 → Permissions → Bucket policy:

{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
  }]
}

Replace YOUR_BUCKET_NAME with your actual bucket name.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MSG
