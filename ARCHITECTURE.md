# Architecture Documentation

## Overview

The Expense Tracker application uses a serverless architecture on AWS, designed for scalability, cost-effectiveness, and high availability.

## Architecture Diagram

```
┌─────────────────┐
│   CloudFront    │ ← CDN with SSL/TLS
│   Distribution  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   S3 Bucket     │ ← Static website hosting
│  (Frontend)     │
└─────────────────┘

┌─────────────────┐
│  API Gateway    │ ← REST API endpoint
│   (Regional)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │   WAF   │ ← Security rules
    └────┬────┘
         │
    ┌────┴──────────────────────┐
    │                           │
┌───▼─────────┐         ┌───────▼────────┐
│   Lambda    │         │    Lambda      │
│ GET Expenses│         │ Create Expense │
└─────────────┘         └────────────────┘
         │                       │
┌────────▼────────┐     ┌────────▼────────┐
│   Lambda        │     │    Lambda       │
│ Update Expense  │     │ Delete Expense  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
             ┌───────▼───────┐
             │   DynamoDB    │
             │    Table      │
             │  + DateIndex  │
             └───────────────┘

┌─────────────────┐
│  CloudWatch     │ ← Logging & Monitoring
│  Logs/Alarms    │
└─────────────────┘
```

## Components

### Frontend Layer

#### CloudFront Distribution
- **Purpose**: Global CDN for static assets
- **Features**:
  - SSL/TLS termination
  - Custom caching policies for static assets vs HTML
  - SPA routing support (404 → index.html)
  - Security headers (HSTS, CSP, X-Frame-Options)
  - Origin Access Control for S3
- **Cost**: Pay-per-data-transfer (first 10TB free/month)

#### S3 Bucket
- **Purpose**: Static website hosting
- **Features**:
  - Versioning enabled
  - Server-side encryption (AES-256)
  - Public access blocked (only CloudFront can access)
  - Static website configuration
- **Cost**: ~$0.023/GB/month storage + requests

### API Layer

#### API Gateway (REST)
- **Purpose**: API endpoint and request routing
- **Features**:
  - REST API with 4 endpoints (GET, POST, PUT, DELETE)
  - CORS configuration
  - Throttling (burst: 100, rate: 100/sec)
  - Request/response logging to CloudWatch
  - WAF integration
- **Cost**: $3.50 per million requests

#### Lambda Functions
- **Purpose**: Business logic execution
- **Functions**:
  1. `get-expenses`: Fetch expenses with optional filtering
  2. `create-expense`: Create new expense record
  3. `update-expense`: Update existing expense
  4. `delete-expense`: Delete expense record
- **Configuration**:
  - Runtime: Node.js 20.x
  - Memory: 256 MB
  - Timeout: 30 seconds
  - Environment variables: TABLE_NAME, AWS_REGION
- **Cost**: Free tier (1M requests/month) + $0.20 per million requests

### Database Layer

#### DynamoDB Table
- **Purpose**: Persistent storage for expenses
- **Schema**:
  - Partition Key: `userId` (String)
  - Sort Key: `expenseId` (String)
  - Attributes: date, amount, category, description, createdAt, updatedAt
- **Indexes**:
  - Global Secondary Index (DateIndex):
    - Partition Key: `userId`
    - Sort Key: `date`
    - Enables efficient date range queries
- **Features**:
  - Pay-per-request billing
  - Encryption at rest (AWS managed keys)
  - Point-in-time recovery enabled
  - Auto-scaling
- **Cost**: ~$0.25 per million requests

### Security Layer

#### AWS WAF
- **Purpose**: Protection against common attacks
- **Rules**:
  - Rate limiting (2000 requests per 5 minutes per IP)
  - AWS Managed Rules - Common Rule Set (SQL injection, XSS, etc.)
  - AWS Managed Rules - Known Bad Inputs
- **Cost**: $5 per web ACL + $1 per million requests

#### IAM Roles
- **Lambda Execution Role**:
  - CloudWatch Logs permissions
  - DynamoDB read/write permissions (scoped to expense table)
  - Least privilege principle

#### CloudFront Security Headers
- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

### Monitoring Layer

#### CloudWatch Logs
- Lambda function logs (14-day retention)
- API Gateway access logs (14-day retention)
- Structured JSON logging

#### CloudWatch Alarms
- Lambda error rate alarms
- Lambda duration alarms
- API Gateway 4xx/5xx error alarms
- DynamoDB throttling alarms

## Data Flow

### Create Expense Flow

1. User submits expense form in browser
2. Next.js app calls API client (`lib/api/expenses.ts`)
3. HTTP POST to API Gateway `/expenses` endpoint
4. WAF validates request (rate limit, security rules)
5. API Gateway invokes `create-expense` Lambda function
6. Lambda validates input and writes to DynamoDB
7. Lambda returns created expense
8. API Gateway returns response to client
9. Next.js app updates UI

### Read Expenses Flow

1. User navigates to expenses page
2. Next.js app calls `getExpenses()` on mount
3. HTTP GET to API Gateway `/expenses` endpoint
4. WAF validates request
5. API Gateway invokes `get-expenses` Lambda function
6. Lambda queries DynamoDB (using DateIndex if date filter provided)
7. Lambda returns expense list
8. API Gateway returns response
9. Next.js app renders expenses

## Security Considerations

### Data Protection
- **Encryption in Transit**: TLS 1.2+ for all connections
- **Encryption at Rest**: 
  - S3: AES-256
  - DynamoDB: AWS managed keys
- **Access Control**:
  - S3 bucket is private (CloudFront OAC)
  - DynamoDB access via IAM roles only
  - No public endpoints expose credentials

### Network Security
- WAF rate limiting prevents DDoS
- WAF managed rules block common attacks
- API Gateway throttling prevents abuse
- CORS configured to allow only necessary origins

### Monitoring & Auditing
- All API calls logged to CloudWatch
- Lambda errors trigger alarms
- DynamoDB throttling monitored
- CloudWatch dashboards for observability

## Scalability

### Auto-Scaling
- **Lambda**: Automatically scales from 0 to thousands of concurrent executions
- **API Gateway**: Handles millions of requests per second
- **DynamoDB**: Auto-scales based on traffic (pay-per-request)
- **CloudFront**: Global edge locations handle traffic spikes

### Performance Optimization
- CloudFront caching for static assets (1 year TTL)
- CloudFront caching for HTML (no cache)
- Lambda connection reuse for DynamoDB
- DynamoDB GSI for efficient date range queries

## Cost Optimization

### Pay-Per-Use Model
- No idle costs (no servers to keep running)
- Pay only for actual usage
- Free tiers for Lambda (1M requests) and CloudFront (10TB transfer)

### Caching Strategy
- Static assets cached at edge (reduces S3 requests)
- API responses not cached (always fresh data)

### Right-Sizing
- Lambda memory optimized (256MB sufficient for most operations)
- DynamoDB pay-per-request (no over-provisioning)

## Disaster Recovery

### Backup
- DynamoDB point-in-time recovery enabled
- Terraform state stored in S3 (versioned)
- Infrastructure as Code enables quick recreation

### High Availability
- All services are multi-AZ by default (AWS managed)
- CloudFront global edge network
- DynamoDB global tables (can be enabled for multi-region)

## Future Enhancements

### Authentication
- Add AWS Cognito for user authentication
- Multi-tenant support with userId isolation
- API authentication via API Gateway authorizers

### Advanced Features
- GraphQL API (AppSync)
- Real-time updates (WebSockets via API Gateway)
- AI-powered categorization (Bedrock/Comprehend)
- Advanced analytics (QuickSight, Athena)

### Performance
- Lambda provisioned concurrency for cold start reduction
- DynamoDB DAX for caching
- CloudFront Lambda@Edge for edge computing

## Best Practices Implemented

1. **Infrastructure as Code**: All resources defined in Terraform
2. **Least Privilege**: IAM roles with minimal required permissions
3. **Monitoring**: Comprehensive CloudWatch logs and alarms
4. **Security**: WAF, encryption, security headers
5. **Scalability**: Serverless auto-scaling components
6. **Cost Optimization**: Pay-per-use, efficient caching
7. **High Availability**: Multi-AZ, global CDN
8. **Disaster Recovery**: Point-in-time recovery, IaC backups

## References

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Serverless Application Model](https://aws.amazon.com/serverless/sam/)
- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

