import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { Expense, ExpenseQueryParams } from './types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || '';

export const getExpense = async (userId: string, expenseId: string): Promise<Expense | null> => {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      userId,
      expenseId,
    },
  });

  const response = await docClient.send(command);
  return (response.Item as Expense) || null;
};

export const getExpenses = async (params: ExpenseQueryParams): Promise<Expense[]> => {
  const userId = params.userId || 'default-user'; // Default user for now (no auth)

  if (params.startDate || params.endDate) {
    // Query using DateIndex GSI
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'DateIndex',
      KeyConditionExpression: 'userId = :userId' + 
        (params.startDate && params.endDate 
          ? ' AND #date BETWEEN :startDate AND :endDate'
          : params.startDate 
          ? ' AND #date >= :startDate'
          : params.endDate 
          ? ' AND #date <= :endDate'
          : ''),
      ExpressionAttributeNames: params.startDate || params.endDate ? { '#date': 'date' } : undefined,
      ExpressionAttributeValues: {
        ':userId': userId,
        ...(params.startDate && { ':startDate': params.startDate }),
        ...(params.endDate && { ':endDate': params.endDate }),
      },
    });

    const response = await docClient.send(command);
    let expenses = (response.Items as Expense[]) || [];

    // Filter by category if provided
    if (params.category) {
      expenses = expenses.filter((expense) => expense.category === params.category);
    }

    return expenses;
  } else {
    // Scan all expenses for user (less efficient, but works for small datasets)
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'userId = :userId' + (params.category ? ' AND category = :category' : ''),
      ExpressionAttributeValues: {
        ':userId': userId,
        ...(params.category && { ':category': params.category }),
      },
    });

    const response = await docClient.send(command);
    return (response.Items as Expense[]) || [];
  }
};

export const createExpense = async (expense: Expense): Promise<Expense> => {
  const now = new Date().toISOString();
  const expenseToCreate = {
    ...expense,
    createdAt: now,
    updatedAt: now,
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: expenseToCreate,
  });

  await docClient.send(command);
  return expenseToCreate;
};

export const updateExpense = async (
  userId: string,
  expenseId: string,
  updates: Partial<Expense>
): Promise<Expense | null> => {
  const existing = await getExpense(userId, expenseId);
  if (!existing) {
    return null;
  }

  const updatedExpense = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      userId,
      expenseId,
    },
    UpdateExpression: 'SET #amount = :amount, #category = :category, #description = :description, #date = :date, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#amount': 'amount',
      '#category': 'category',
      '#description': 'description',
      '#date': 'date',
    },
    ExpressionAttributeValues: {
      ':amount': updatedExpense.amount,
      ':category': updatedExpense.category,
      ':description': updatedExpense.description,
      ':date': updatedExpense.date,
      ':updatedAt': updatedExpense.updatedAt,
    },
    ReturnValues: 'ALL_NEW',
  });

  const response = await docClient.send(command);
  return (response.Attributes as Expense) || null;
};

export const deleteExpense = async (userId: string, expenseId: string): Promise<boolean> => {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      userId,
      expenseId,
    },
    ReturnValues: 'ALL_OLD',
  });

  const response = await docClient.send(command);
  return !!response.Attributes;
};

