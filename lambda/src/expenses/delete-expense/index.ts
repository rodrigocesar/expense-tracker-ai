import { ApiGatewayEvent } from '../../shared/types';
import { successResponse, badRequestResponse, notFoundResponse, errorResponse } from '../../shared/response';
import { deleteExpense } from '../../shared/dynamodb-client';

const DEFAULT_USER_ID = 'default-user';

export const handler = async (event: ApiGatewayEvent) => {
  try {
    const expenseId = event.pathParameters?.id;
    
    if (!expenseId) {
      return badRequestResponse('Expense ID is required');
    }

    const deleted = await deleteExpense(DEFAULT_USER_ID, expenseId);

    if (!deleted) {
      return notFoundResponse('Expense not found');
    }

    return successResponse({
      message: 'Expense deleted successfully',
      expenseId,
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return errorResponse('Failed to delete expense', 500, error);
  }
};

