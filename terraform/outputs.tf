output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = module.api.api_gateway_url
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = module.api.api_gateway_id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.frontend.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.frontend.cloudfront_domain_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for frontend assets"
  value       = module.frontend.s3_bucket_name
}

output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = module.dynamodb.table_name
}

output "dynamodb_table_arn" {
  description = "DynamoDB table ARN"
  value       = module.dynamodb.table_arn
}

output "lambda_function_names" {
  description = "Lambda function names"
  value       = module.api.lambda_function_names
}

output "waf_web_acl_id" {
  description = "WAF Web ACL ID"
  value       = try(module.security.waf_web_acl_id, null)
}

