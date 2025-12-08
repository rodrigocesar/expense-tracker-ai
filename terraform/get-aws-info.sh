#!/bin/bash

# Script to help retrieve AWS information for terraform.tfvars

echo "=== AWS Account Information ==="
echo ""

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text 2>/dev/null)
if [ -n "$ACCOUNT_ID" ]; then
  echo "AWS Account ID: $ACCOUNT_ID"
else
  echo "❌ Could not retrieve AWS Account ID. Make sure AWS CLI is configured."
fi

echo ""

# Get default region
DEFAULT_REGION=$(aws configure get region 2>/dev/null)
if [ -n "$DEFAULT_REGION" ]; then
  echo "Default AWS Region: $DEFAULT_REGION"
else
  echo "⚠️  No default region configured"
fi

echo ""
echo "=== ACM Certificates (us-east-1 - Required for CloudFront Custom Domains) ==="
echo ""
echo "ℹ️  Note: All your resources (Lambda, DynamoDB, API Gateway, S3) are in eu-west-1."
echo "   CloudFront is global. Only ACM certificates for custom domains must be in us-east-1."
echo "   If you don't need a custom domain, you can skip this section!"
echo ""

# Check for certificates in us-east-1 (required for CloudFront)
CERTIFICATES_US_EAST=$(aws acm list-certificates --region us-east-1 --query 'CertificateSummaryList[*].[DomainName,CertificateArn,Status]' --output table 2>/dev/null)

if [ -n "$CERTIFICATES_US_EAST" ] && [ "$CERTIFICATES_US_EAST" != "" ]; then
  echo "$CERTIFICATES_US_EAST"
  echo ""
  echo "✅ Found certificates in us-east-1. Use one of the ARNs above for certificate_arn"
else
  echo "⚠️  No certificates found in us-east-1"
  echo ""
  echo "To create a certificate for CloudFront (only if you need a custom domain):"
  echo "  1. Go to AWS Certificate Manager (ACM) in us-east-1 region"
  echo "  2. Request a public certificate for your domain"
  echo "  3. Validate the certificate (DNS or email validation)"
  echo "  4. Copy the ARN and use it in terraform.tfvars"
  echo ""
  echo "Note: CloudFront requires certificates to be in us-east-1 region (AWS limitation)."
  echo "      This is the ONLY resource that needs to be in us-east-1!"
fi

echo ""
echo "=== ACM Certificates (eu-west-1 - Your resource region) ==="
echo ""

# Check for certificates in default region
CERTIFICATES_EU_WEST=$(aws acm list-certificates --region eu-west-1 --query 'CertificateSummaryList[*].[DomainName,CertificateArn,Status]' --output table 2>/dev/null)

if [ -n "$CERTIFICATES_EU_WEST" ] && [ "$CERTIFICATES_EU_WEST" != "" ]; then
  echo "$CERTIFICATES_EU_WEST"
  echo ""
  echo "ℹ️  These certificates are in eu-west-1 and can be used for API Gateway or other services."
  echo "   However, CloudFront requires certificates in us-east-1 for custom domains."
  echo "   If you need a custom domain for CloudFront, request a new certificate in us-east-1."
else
  echo "No certificates found in eu-west-1"
  echo ""
  echo "ℹ️  Certificates in eu-west-1 can be used for API Gateway custom domains."
  echo "   For CloudFront custom domains, you'll need a certificate in us-east-1."
fi

echo ""
echo "=== Quick Commands ==="
echo ""
echo "To list all certificates in us-east-1:"
echo "  aws acm list-certificates --region us-east-1 --output table"
echo ""
echo "To get certificate details (replace CERT_ARN):"
echo "  aws acm describe-certificate --region us-east-1 --certificate-arn CERT_ARN"
echo ""
echo "To request a new certificate:"
echo "  aws acm request-certificate --region us-east-1 --domain-name yourdomain.com --validation-method DNS"

