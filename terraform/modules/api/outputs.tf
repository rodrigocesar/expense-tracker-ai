output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_api_gateway_rest_api.api.id
}

output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
}

output "api_gateway_arn" {
  description = "API Gateway ARN"
  value       = aws_api_gateway_rest_api.api.arn
}

output "api_gateway_execution_arn" {
  description = "API Gateway execution ARN"
  value       = aws_api_gateway_rest_api.api.execution_arn
}

output "lambda_function_names" {
  description = "List of Lambda function names"
  value       = [for func in aws_lambda_function.expenses_api : func.function_name]
}

output "lambda_function_arns" {
  description = "Map of Lambda function ARNs"
  value       = { for k, v in aws_lambda_function.expenses_api : k => v.arn }
}

