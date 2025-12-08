#!/bin/bash

# Deployment script for Expense Tracker Frontend
# This script builds the Next.js app and deploys it to S3/CloudFront

set -e  # Exit on error

echo "🚀 Starting frontend deployment..."
echo ""

# Get Terraform outputs
TERRAFORM_DIR="terraform"
if [ ! -d "$TERRAFORM_DIR" ]; then
  echo "❌ Error: terraform directory not found"
  exit 1
fi

echo "📋 Getting infrastructure information from Terraform..."
API_URL=$(terraform -chdir=$TERRAFORM_DIR output -raw api_gateway_url)
S3_BUCKET=$(terraform -chdir=$TERRAFORM_DIR output -raw s3_bucket_name)
DISTRIBUTION_ID=$(terraform -chdir=$TERRAFORM_DIR output -raw cloudfront_distribution_id)
CLOUDFRONT_URL=$(terraform -chdir=$TERRAFORM_DIR output -raw cloudfront_domain_name)
AWS_REGION=$(terraform -chdir=$TERRAFORM_DIR output -raw aws_region 2>/dev/null || echo "eu-west-1")

echo "✅ Infrastructure details:"
echo "   API Gateway URL: $API_URL"
echo "   S3 Bucket: $S3_BUCKET"
echo "   CloudFront Distribution: $DISTRIBUTION_ID"
echo "   CloudFront URL: https://$CLOUDFRONT_URL"
echo ""

# Check if .env.local exists, create/update it
echo "📝 Configuring environment variables..."
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=$API_URL
NEXT_EXPORT=true
EOF
echo "✅ Created .env.local with API URL: $API_URL"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Build the application
echo "🔨 Building Next.js application for static export..."
NEXT_EXPORT=true npm run build

if [ ! -d "out" ]; then
  echo "❌ Error: Build failed - 'out' directory not found"
  exit 1
fi

echo "✅ Build completed successfully"
echo ""

# Deploy to S3
echo "📤 Deploying to S3 bucket: $S3_BUCKET"
aws s3 sync out/ s3://$S3_BUCKET --delete --region $AWS_REGION

if [ $? -ne 0 ]; then
  echo "❌ Error: S3 deployment failed"
  exit 1
fi

echo "✅ Files uploaded to S3"
echo ""

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

if [ $? -ne 0 ]; then
  echo "⚠️  Warning: CloudFront cache invalidation failed (but deployment succeeded)"
else
  echo "✅ CloudFront cache invalidation created: $INVALIDATION_ID"
  echo "   Note: Cache invalidation may take a few minutes to complete"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📍 Your application is available at:"
echo "   https://$CLOUDFRONT_URL"
echo ""
echo "⏳ Note: It may take a few minutes for CloudFront to propagate changes."
echo "   If you don't see your changes immediately, wait 2-5 minutes and refresh."

