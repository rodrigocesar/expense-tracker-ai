# Lambda Functions

This directory contains the Lambda functions for the Expense Tracker API.

## Structure

```
lambda/
├── src/
│   ├── expenses/
│   │   ├── get-expenses/
│   │   ├── create-expense/
│   │   ├── update-expense/
│   │   └── delete-expense/
│   └── shared/
│       ├── dynamodb-client.ts
│       ├── response.ts
│       ├── validation.ts
│       └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js 18+
- npm
- TypeScript

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build TypeScript:
   ```bash
   npm run build
   ```

   This compiles TypeScript files to JavaScript in the `dist/` directory.

3. Test locally (optional):
   Use AWS SAM or the Lambda runtime interface emulator for local testing.

## Lambda Functions

### get-expenses
- **Method**: GET
- **Endpoint**: `/expenses`
- **Query Parameters**: 
  - `startDate` (optional): Filter expenses from this date
  - `endDate` (optional): Filter expenses to this date
  - `category` (optional): Filter by category
- **Returns**: List of expenses

### create-expense
- **Method**: POST
- **Endpoint**: `/expenses`
- **Body**: Expense object (date, amount, category, description)
- **Returns**: Created expense

### update-expense
- **Method**: PUT
- **Endpoint**: `/expenses/{id}`
- **Body**: Expense object (date, amount, category, description)
- **Returns**: Updated expense

### delete-expense
- **Method**: DELETE
- **Endpoint**: `/expenses/{id}`
- **Returns**: Success message

## Shared Utilities

### dynamodb-client.ts
DynamoDB operations wrapper:
- `getExpense()`: Get single expense
- `getExpenses()`: Get expenses with filtering
- `createExpense()`: Create new expense
- `updateExpense()`: Update existing expense
- `deleteExpense()`: Delete expense

### response.ts
API Gateway response formatters:
- `successResponse()`: 200 OK response
- `errorResponse()`: Error response
- `badRequestResponse()`: 400 Bad Request
- `notFoundResponse()`: 404 Not Found
- `internalErrorResponse()`: 500 Internal Server Error

### validation.ts
Input validation:
- `validateExpense()`: Validate expense data
- `parseExpenseFromBody()`: Parse JSON body

### types.ts
TypeScript interfaces:
- `Expense`: Expense data structure
- `ApiGatewayEvent`: API Gateway event structure
- `ApiGatewayResponse`: API Gateway response structure

## Environment Variables

Required environment variables (set by Terraform):
- `TABLE_NAME`: DynamoDB table name
- `AWS_REGION`: AWS region

## Deployment

Lambda functions are automatically deployed by Terraform:

1. Terraform builds the functions during `terraform apply`
2. Each function is packaged as a ZIP file
3. ZIP files are uploaded to Lambda
4. Functions are connected to API Gateway endpoints

## Local Testing

To test locally, you can use the AWS SAM CLI or create a test script:

```typescript
import { handler } from './src/expenses/get-expenses';

const event = {
  httpMethod: 'GET',
  path: '/expenses',
  pathParameters: null,
  queryStringParameters: { startDate: '2024-01-01' },
  body: null,
  headers: {},
  requestContext: {
    requestId: 'test-request-id',
    identity: {
      sourceIp: '127.0.0.1',
    },
  },
};

handler(event).then(console.log);
```

## Error Handling

All functions include:
- Input validation
- Error catching and logging
- Appropriate HTTP status codes
- CORS headers in responses

## Logging

Functions use `console.log`/`console.error` which automatically go to CloudWatch Logs:
- `/aws/lambda/expense-tracker-get-expenses-dev`
- `/aws/lambda/expense-tracker-create-expense-dev`
- etc.

## Monitoring

CloudWatch alarms are configured for:
- Error rates
- Duration thresholds
- Throttling events

Check CloudWatch dashboards for metrics and logs.

