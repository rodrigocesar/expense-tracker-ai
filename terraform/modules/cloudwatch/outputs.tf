output "lambda_log_group_names" {
  description = "CloudWatch log group names for Lambda functions"
  value       = { for k, v in aws_cloudwatch_log_group.lambda_logs : k => v.name }
}

output "api_gateway_log_group_name" {
  description = "CloudWatch log group name for API Gateway"
  value       = aws_cloudwatch_log_group.api_gateway.name
}

