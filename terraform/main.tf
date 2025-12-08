# DynamoDB Module
module "dynamodb" {
  source = "./modules/dynamodb"

  project_name = var.project_name
  environment  = var.environment

  enable_point_in_time_recovery = var.enable_dynamodb_point_in_time_recovery
  billing_mode                  = var.dynamodb_billing_mode
}

# Security Module (IAM, WAF, CloudWatch)
module "security" {
  source = "./modules/security"

  project_name = var.project_name
  environment  = var.environment

  enable_waf     = var.enable_waf
  waf_rate_limit = var.waf_rate_limit
}

# API Module (API Gateway + Lambda)
module "api" {
  source = "./modules/api"

  project_name = var.project_name
  environment  = var.environment

  dynamodb_table_name = module.dynamodb.table_name
  dynamodb_table_arn  = module.dynamodb.table_arn

  lambda_execution_role_arn = module.security.lambda_execution_role_arn
  lambda_execution_role_id  = module.security.lambda_execution_role_name

  lambda_timeout           = var.lambda_timeout
  lambda_memory_size       = var.lambda_memory_size
  api_gateway_throttle_burst_limit = var.api_gateway_throttle_burst_limit
  api_gateway_throttle_rate_limit  = var.api_gateway_throttle_rate_limit

  enable_waf     = var.enable_waf
  waf_web_acl_id  = try(module.security.waf_web_acl_id, null)
  waf_web_acl_arn = try(module.security.waf_web_acl_arn, null)

  depends_on = [
    module.dynamodb,
    module.security
  ]
}

# Frontend Module (S3 + CloudFront)
module "frontend" {
  source = "./modules/frontend"

  project_name = var.project_name
  environment  = var.environment

  domain_name     = var.domain_name
  certificate_arn = var.certificate_arn

  cloudfront_price_class = var.cloudfront_price_class

  # WAF for CloudFront requires CLOUDFRONT scope (different from REGIONAL WAF for API Gateway)
  # For now, CloudFront WAF is disabled. To enable, create a separate CLOUDFRONT-scoped WAF.
  waf_web_acl_id = null

  depends_on = [
    module.security,
    module.api
  ]
}

# CloudWatch Module (Monitoring and Alarms)
module "cloudwatch" {
  source = "./modules/cloudwatch"

  project_name = var.project_name
  environment  = var.environment

  api_gateway_id = module.api.api_gateway_id
  lambda_function_names = module.api.lambda_function_names
  dynamodb_table_name   = module.dynamodb.table_name

  depends_on = [
    module.api,
    module.dynamodb
  ]
}

