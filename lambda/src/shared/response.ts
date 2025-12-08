import { ApiGatewayResponse } from './types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

export const successResponse = (data: any, statusCode: number = 200): ApiGatewayResponse => {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(data),
  };
};

export const errorResponse = (message: string, statusCode: number = 500, error?: any): ApiGatewayResponse => {
  const response: any = {
    error: message,
  };

  if (error) {
    response.details = error instanceof Error ? error.message : String(error);
  }

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(response),
  };
};

export const badRequestResponse = (message: string): ApiGatewayResponse => {
  return errorResponse(message, 400);
};

export const notFoundResponse = (message: string = 'Resource not found'): ApiGatewayResponse => {
  return errorResponse(message, 404);
};

export const internalErrorResponse = (message: string = 'Internal server error', error?: any): ApiGatewayResponse => {
  return errorResponse(message, 500, error);
};

