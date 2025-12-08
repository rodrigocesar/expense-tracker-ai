# Deployment Guide

This guide covers deploying the Expense Tracker application to AWS using Terraform.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured (`aws configure`)
- Terraform >= 1.5.0
- Node.js 18+ and npm
- Git

## Step 1: Configure AWS Credentials

```bash
aws configure
```

Enter your AWS Access Key ID, Secret Access Key, default region, and output format.

## Step 2: Prepare Terraform Configuration

1. Navigate to the terraform directory:
   ```bash
   cd terraform
   ```

2. Copy the example variables file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

3. Edit `terraform.tfvars` with your settings:
   ```hcl
   aws_region  = "us-east-1"
   environment = "dev"
   project_name = "expense-tracker"
   ```

## Step 3: Initialize Terraform

```bash
terraform init
```

This downloads the AWS provider and initializes the backend.

## Step 4: Plan Infrastructure

Review what will be created:

```bash
terraform plan
```

## Step 5: Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This will:
- Create DynamoDB table
- Create API Gateway and Lambda functions
- Create S3 bucket and CloudFront distribution
- Configure WAF and security settings
- Set up CloudWatch monitoring

**Note**: This may take 10-15 minutes to complete.

## Step 6: Get Deployment Outputs

After deployment completes, note the outputs:

```bash
terraform output
```

Key outputs:
- `api_gateway_url`: Your API endpoint (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com/dev`)
- `cloudfront_domain_name`: CloudFront URL (e.g., `d1234567890.cloudfront.net`)
- `s3_bucket_name`: S3 bucket name for frontend

## Step 7: Build Frontend

1. Navigate back to project root:
   ```bash
   cd ..
   ```

2. Create `.env.local` file:
   ```bash
   echo "NEXT_PUBLIC_API_URL=$(terraform -chdir=terraform output -raw api_gateway_url)" > .env.local
   echo "NEXT_EXPORT=true" >> .env.local
   ```

   Or manually create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-gateway-url/dev
   NEXT_EXPORT=true
   ```

3. Install dependencies (if not already done):
   ```bash
   npm install
   ```

4. Build for static export:
   ```bash
   npm run build:static
   ```

   This creates the `out/` directory with static files.

## Step 8: Deploy Frontend to S3

```bash
S3_BUCKET=$(terraform -chdir=terraform output -raw s3_bucket_name)
aws s3 sync out/ s3://$S3_BUCKET --delete
```

Or manually:
```bash
aws s3 sync out/ s3://expense-tracker-frontend-dev --delete
```

## Step 9: Invalidate CloudFront Cache

```bash
DISTRIBUTION_ID=$(terraform -chdir=terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

Or manually:
```bash
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"
```

## Step 10: Access Your Application

Wait a few minutes for CloudFront propagation, then access your application:

```bash
terraform -chdir=terraform output cloudfront_domain_name
```

Open the URL in your browser.

## Updating the Application

### Update Frontend

1. Make changes to the Next.js app
2. Rebuild:
   ```bash
   npm run build:static
   ```
3. Deploy:
   ```bash
   S3_BUCKET=$(terraform -chdir=terraform output -raw s3_bucket_name)
   aws s3 sync out/ s3://$S3_BUCKET --delete
   ```
4. Invalidate cache:
   ```bash
   DISTRIBUTION_ID=$(terraform -chdir=terraform output -raw cloudfront_distribution_id)
   aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
   ```

### Update Lambda Functions

1. Make changes to Lambda code in `lambda/src/`
2. Terraform will automatically rebuild on next apply:
   ```bash
   cd terraform
   terraform apply
   ```

Or manually rebuild:
```bash
cd lambda
npm install
npm run build
cd ../terraform
terraform apply
```

### Update Infrastructure

1. Modify Terraform files
2. Review changes:
   ```bash
   terraform plan
   ```
3. Apply:
   ```bash
   terraform apply
   ```

## Custom Domain Setup (Optional)

1. Request an ACM certificate in `us-east-1` (required for CloudFront):
   ```bash
   aws acm request-certificate \
     --domain-name expenses.example.com \
     --validation-method DNS \
     --region us-east-1
   ```

2. Add DNS validation records to your domain

3. Wait for certificate validation

4. Update `terraform.tfvars`:
   ```hcl
   domain_name     = "expenses.example.com"
   certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/abc123..."
   ```

5. Apply changes:
   ```bash
   terraform apply
   ```

6. Update your domain's DNS to point to CloudFront:
   - Get the CloudFront domain name from outputs
   - Create a CNAME record: `expenses.example.com` → `d1234567890.cloudfront.net`

## Troubleshooting

### Terraform apply fails with "Error building Lambda"

- Ensure Node.js is installed: `node --version`
- Check Lambda dependencies: `cd lambda && npm install`
- Verify TypeScript compilation: `cd lambda && npm run build`

### API returns CORS errors

- Verify API URL in `.env.local` matches the output from Terraform
- Check that CORS is enabled in API Gateway (should be automatic)

### CloudFront shows 403 Forbidden

- Verify S3 bucket policy allows CloudFront
- Check Origin Access Control in CloudFront configuration
- Ensure files are uploaded to S3 bucket

### DynamoDB operations fail

- Check Lambda IAM role has DynamoDB permissions
- Verify table name matches in Lambda environment variables
- Check CloudWatch logs for specific error messages

## Cleanup

To destroy all infrastructure:

```bash
cd terraform
terraform destroy
```

**Warning**: This will delete all resources including:
- DynamoDB table and all data
- Lambda functions
- API Gateway
- S3 bucket contents
- CloudFront distribution

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: hashicorp/setup-terraform@v2
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy Infrastructure
        run: |
          cd terraform
          terraform init
          terraform apply -auto-approve
      
      - name: Build Frontend
        run: |
          npm install
          echo "NEXT_PUBLIC_API_URL=$(cd terraform && terraform output -raw api_gateway_url)" >> .env.local
          echo "NEXT_EXPORT=true" >> .env.local
          npm run build:static
      
      - name: Deploy Frontend
        run: |
          S3_BUCKET=$(cd terraform && terraform output -raw s3_bucket_name)
          DIST_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
          aws s3 sync out/ s3://$S3_BUCKET --delete
          aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

## Support

For issues or questions:
1. Check CloudWatch logs for Lambda errors
2. Review Terraform state: `terraform show`
3. Verify AWS service quotas and limits

