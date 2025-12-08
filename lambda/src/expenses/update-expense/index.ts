import { ApiGatewayEvent } from '../../shared/types';
import { successResponse, badRequestResponse, notFoundResponse, errorResponse } from '../../shared/response';
import { updateExpense } from '../../shared/dynamodb-client';
import { validateExpense, parseExpenseFromBody } from '../../shared/validation';

const DEFAULT_USER_ID = 'default-user';

export const handler = async (event: ApiGatewayEvent) => {
  try {
    const expenseId = event.pathParameters?.id;
    
    if (!expenseId) {
      return badRequestResponse('Expense ID is required');
    }

    const body = parseExpenseFromBody(event.body);
    
    if (!body) {
      return badRequestResponse('Invalid request body');
    }

    const validation = validateExpense(body);
    if (!validation.valid) {
      return badRequestResponse(validation.error || 'Invalid expense data');
    }

    const updates = {
      date: body.date,
      amount: body.amount,
      category: body.category,
      description: body.description.trim(),
    };

    const updatedExpense = await updateExpense(DEFAULT_USER_ID, expenseId, updates);

    if (!updatedExpense) {
      return notFoundResponse('Expense not found');
    }

    return successResponse({
      expense: updatedExpense,
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return errorResponse('Failed to update expense', 500, error);
  }
};

