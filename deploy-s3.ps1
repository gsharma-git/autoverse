# AutoMarketplace - S3 deploy (PowerShell for Windows)
#
# Usage:
#   $env:S3_BUCKET = "your-bucket-name"
#   .\deploy-s3.ps1

param(
    [string]$Bucket = $env:S3_BUCKET,
    [string]$Region = "ap-south-1",
    [string]$CloudFrontDistId = $env:CLOUDFRONT_DIST_ID
)

if ($env:AWS_REGION) { $Region = $env:AWS_REGION }

if (-not $Bucket) {
    Write-Error 'Set S3_BUCKET first: $env:S3_BUCKET = "your-bucket-name"'
    exit 1
}

$DistDir = "dist\client"

Write-Host "Building static SPA..." -ForegroundColor Cyan
npm run build:s3
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; exit 1 }

Write-Host "Uploading hashed assets (long cache)..." -ForegroundColor Cyan
aws s3 sync $DistDir "s3://$Bucket" --region $Region --delete --cache-control "public, max-age=31536000, immutable" --exclude "*.html" --exclude "*.json"

Write-Host "Uploading HTML/JSON (no-cache)..." -ForegroundColor Cyan
aws s3 sync $DistDir "s3://$Bucket" --region $Region --cache-control "public, no-cache, must-revalidate" --exclude "*" --include "*.html" --include "*.json"

Write-Host "Deploy complete!" -ForegroundColor Green
Write-Host "URL: http://$Bucket.s3-website.$Region.amazonaws.com" -ForegroundColor Green

if ($CloudFrontDistId) {
    Write-Host "Invalidating CloudFront $CloudFrontDistId..." -ForegroundColor Cyan
    aws cloudfront create-invalidation --distribution-id $CloudFrontDistId --paths "/*"
    Write-Host "Invalidation submitted" -ForegroundColor Green
}

Write-Host ""
Write-Host "BUCKET POLICY - paste into S3 > Permissions > Bucket policy:"
Write-Host ""
Write-Host '{'
Write-Host '  "Version": "2012-10-17",'
Write-Host '  "Statement": [{'
Write-Host '    "Sid": "PublicReadGetObject",'
Write-Host '    "Effect": "Allow",'
Write-Host '    "Principal": "*",'
Write-Host '    "Action": "s3:GetObject",'
Write-Host "    `"Resource`": `"arn:aws:s3:::$Bucket/*`""
Write-Host '  }]'
Write-Host '}'
