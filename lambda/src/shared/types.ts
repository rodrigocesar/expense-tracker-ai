export interface Expense {
  id: string;
  userId: string;
  expenseId: string;
  date: string; // ISO date string
  amount: number;
  category: 'Food' | 'Transportation' | 'Entertainment' | 'Shopping' | 'Bills' | 'Other';
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseQueryParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}

export interface ApiGatewayEvent {
  httpMethod: string;
  path: string;
  pathParameters: { [key: string]: string } | null;
  queryStringParameters: { [key: string]: string } | null;
  body: string | null;
  headers: { [key: string]: string };
  requestContext: {
    requestId: string;
    identity: {
      sourceIp: string;
    };
  };
}

export interface ApiGatewayResponse {
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
}

