import { v4 as uuidv4 } from 'uuid';
import { ApiGatewayEvent } from '../../shared/types';
import { successResponse, badRequestResponse, errorResponse } from '../../shared/response';
import { createExpense } from '../../shared/dynamodb-client';
import { validateExpense, parseExpenseFromBody } from '../../shared/validation';

const DEFAULT_USER_ID = 'default-user';

export const handler = async (event: ApiGatewayEvent) => {
  try {
    const body = parseExpenseFromBody(event.body);
    
    if (!body) {
      return badRequestResponse('Invalid request body');
    }

    const validation = validateExpense(body);
    if (!validation.valid) {
      return badRequestResponse(validation.error || 'Invalid expense data');
    }

    const expenseId = uuidv4();
    const expense = {
      id: expenseId,
      userId: DEFAULT_USER_ID,
      expenseId: expenseId,
      date: body.date,
      amount: body.amount,
      category: body.category,
      description: body.description.trim(),
    };

    const createdExpense = await createExpense(expense);

    return successResponse({
      expense: createdExpense,
    }, 201);
  } catch (error) {
    console.error('Error creating expense:', error);
    return errorResponse('Failed to create expense', 500, error);
  }
};

