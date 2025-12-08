import { ApiGatewayEvent } from '../../shared/types';
import { successResponse, errorResponse } from '../../shared/response';
import { getExpenses } from '../../shared/dynamodb-client';

const DEFAULT_USER_ID = 'default-user';

export const handler = async (event: ApiGatewayEvent) => {
  try {
    const queryParams = event.queryStringParameters || {};
    
    const params = {
      userId: DEFAULT_USER_ID, // For now, use default user (no auth)
      startDate: queryParams.startDate || undefined,
      endDate: queryParams.endDate || undefined,
      category: queryParams.category || undefined,
    };

    const expenses = await getExpenses(params);

    return successResponse({
      expenses,
      count: expenses.length,
    });
  } catch (error) {
    console.error('Error getting expenses:', error);
    return errorResponse('Failed to retrieve expenses', 500, error);
  }
};

