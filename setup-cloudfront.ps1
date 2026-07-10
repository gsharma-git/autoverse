# Creates a CloudFront distribution in front of your S3 bucket.
# Run ONCE after the bucket is deployed.
#
# Usage:
#   $env:S3_BUCKET = "your-bucket-name"
#   .\setup-cloudfront.ps1

param(
    [string]$Bucket = $env:S3_BUCKET,
    [string]$Region = "ap-south-1"
)

if ($env:AWS_REGION) { $Region = $env:AWS_REGION }

if (-not $Bucket) {
    Write-Error 'Set S3_BUCKET first: $env:S3_BUCKET = "your-bucket-name"'
    exit 1
}

$OriginDomain = "$Bucket.s3-website.$Region.amazonaws.com"
$CallerRef    = "automarketplace-$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-Host "Creating CloudFront distribution for $OriginDomain ..." -ForegroundColor Cyan

$config = @"
{
  "CallerReference": "$CallerRef",
  "Comment": "AutoMarketplace SPA",
  "DefaultRootObject": "index.html",
  "HttpVersion": "http2and3",
  "IsIPV6Enabled": true,
  "PriceClass": "PriceClass_All",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "S3Website",
      "DomainName": "$OriginDomain",
      "CustomOriginConfig": {
        "HTTPPort": 80,
        "HTTPSPort": 443,
        "OriginProtocolPolicy": "http-only"
      }
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3Website",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true,
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"] }
    },
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6"
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 0
      },
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 0
      }
    ]
  }
}
"@

# Write without BOM — AWS CLI rejects UTF-8 BOM
$tmpFile = [System.IO.Path]::GetTempFileName() + ".json"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($tmpFile, $config, $utf8NoBom)

$rawResult = aws cloudfront create-distribution --distribution-config "file://$tmpFile" 2>&1
Remove-Item $tmpFile

if ($LASTEXITCODE -ne 0) {
    Write-Error "CloudFront creation failed:`n$rawResult"
    exit 1
}

$result  = $rawResult | ConvertFrom-Json
$distId  = $result.Distribution.Id
$distUrl = $result.Distribution.DomainName

Write-Host ""
Write-Host "Distribution created!" -ForegroundColor Green
Write-Host "  ID:  $distId"
Write-Host "  URL: https://$distUrl"
Write-Host ""
Write-Host "CloudFront takes ~5 minutes to deploy globally." -ForegroundColor Yellow
Write-Host ""
Write-Host "Future deploys (build + upload + cache clear):"
Write-Host "  `$env:S3_BUCKET = `"$Bucket`""
Write-Host "  `$env:CLOUDFRONT_DIST_ID = `"$distId`""
Write-Host "  .\deploy-s3.ps1"
