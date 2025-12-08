# Terraform Infrastructure

This directory contains Terraform configuration for deploying the Expense Tracker application to AWS using a serverless architecture.

## Architecture Overview

- **Frontend**: Next.js static export → S3 → CloudFront CDN
- **Backend API**: API Gateway (REST) → Lambda functions
- **Database**: DynamoDB with Global Secondary Index
- **Security**: WAF, IAM roles, CloudFront security headers
- **Monitoring**: CloudWatch Logs and Alarms

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.5.0 installed
3. Node.js 18+ installed (for Lambda function builds)
4. npm installed

## Setup

1. Copy the example variables file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edit `terraform.tfvars` with your configuration:
   ```hcl
   environment = "dev"
   aws_region  = "eu-west-1"
   project_name = "expense-tracker"
   ```

3. (Optional) Configure Terraform backend in `providers.tf`:
   ```hcl
   backend "s3" {
     bucket         = "your-terraform-state-bucket"
     key            = "expense-tracker/terraform.tfstate"
     region         = "eu-west-1"
     encrypt        = true
     dynamodb_table = "terraform-state-lock"
   }
   ```

## Deployment

1. Initialize Terraform:
   ```bash
   terraform init
   ```

2. Review the planned changes:
   ```bash
   terraform plan
   ```

3. Apply the infrastructure:
   ```bash
   terraform apply
   ```

4. After deployment, note the outputs:
   - `api_gateway_url`: API endpoint URL
   - `cloudfront_domain_name`: CloudFront distribution domain
   - `s3_bucket_name`: S3 bucket for frontend deployment

## Building and Deploying Lambda Functions

Lambda functions are automatically built during `terraform apply`. The build process:
1. Installs npm dependencies
2. Compiles TypeScript to JavaScript
3. Bundles the code into ZIP files

To manually build Lambda functions:
```bash
cd lambda
npm install
npm run build
```

## Frontend Deployment

After infrastructure is deployed:

1. Build the Next.js app for static export:
   ```bash
   cd ..
   npm run build:static
   ```

2. Deploy to S3:
   ```bash
   aws s3 sync out/ s3://<s3_bucket_name> --delete
   ```

3. Invalidate CloudFront cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id <distribution_id> --paths "/*"
   ```

## Variables

See `variables.tf` for all available variables and their descriptions.

Key variables:
- `aws_region`: AWS region for resources
- `environment`: Environment name (dev/staging/prod)
- `project_name`: Project name for resource naming
- `domain_name`: (Optional) Custom domain for CloudFront
- `certificate_arn`: (Optional) ACM certificate ARN for custom domain
- `enable_waf`: Enable AWS WAF (default: true)
- `waf_rate_limit`: WAF rate limit per 5 minutes (default: 2000)

## Modules

- `modules/dynamodb`: DynamoDB table configuration
- `modules/api`: API Gateway and Lambda functions
- `modules/frontend`: S3 bucket and CloudFront distribution
- `modules/security`: IAM roles, WAF, and security policies
- `modules/cloudwatch`: CloudWatch logs and alarms

## Outputs

- `api_gateway_url`: API Gateway endpoint URL
- `cloudfront_domain_name`: CloudFront distribution domain
- `s3_bucket_name`: S3 bucket name
- `dynamodb_table_name`: DynamoDB table name

## Cleanup

To destroy all resources:
```bash
terraform destroy
```

**Warning**: This will delete all infrastructure including data in DynamoDB.

## Troubleshooting

### Lambda functions fail to build
- Ensure Node.js and npm are installed
- Check that `lambda/package.json` exists and is valid
- Verify TypeScript compilation works: `cd lambda && npm run build`

### API Gateway returns CORS errors
- Verify CORS is configured in `modules/api/main.tf`
- Check that the frontend is using the correct API URL

### CloudFront returns 403 errors
- Verify S3 bucket policy allows CloudFront access
- Check Origin Access Control configuration

## Cost Estimation

Approximate monthly costs for low traffic:
- DynamoDB: ~$0.25 per million requests
- Lambda: Free tier + $0.20 per million requests
- API Gateway: $3.50 per million requests
- CloudFront: First 10TB free, then data transfer costs
- S3: ~$0.023/GB/month
- WAF: $5 per web ACL + $1 per million requests

**Total**: ~$5-15/month for low traffic

