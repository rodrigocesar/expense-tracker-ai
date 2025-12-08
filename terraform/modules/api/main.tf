# Data source for current AWS region
data "aws_region" "current" {}

# Data source for current AWS caller identity
data "aws_caller_identity" "current" {}

# Build Lambda functions (install dependencies and compile)
resource "null_resource" "lambda_build" {
  triggers = {
    source_code = sha256(join("", [
      for f in fileset("${path.module}/../../../lambda/src", "**/*.ts") : 
      filesha256("${path.module}/../../../lambda/src/${f}")
    ]))
    package_json = filesha256("${path.module}/../../../lambda/package.json")
  }

  provisioner "local-exec" {
    working_dir = "${path.module}/../../../lambda"
    command     = <<-EOT
      npm install
      npm run build || true
    EOT
  }
}

# Archive Lambda function code (from dist directory after build)
data "archive_file" "lambda_zip" {
  for_each = local.lambda_functions

  type        = "zip"
  source_dir  = "${path.module}/../../../lambda/dist/${each.key}"
  output_path = "${path.module}/.terraform/${each.key}.zip"

  depends_on = [null_resource.lambda_build]
}

# DynamoDB IAM policy for Lambda
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.project_name}-lambda-dynamodb-${var.environment}"
  role = var.lambda_execution_role_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          var.dynamodb_table_arn,
          "${var.dynamodb_table_arn}/index/*"
        ]
      }
    ]
  })
}

# Lambda functions
resource "aws_lambda_function" "expenses_api" {
  for_each = local.lambda_functions

  function_name = "${var.project_name}-${each.key}-${var.environment}"
  role          = var.lambda_execution_role_arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory_size

  filename         = data.archive_file.lambda_zip[each.key].output_path
  source_code_hash = data.archive_file.lambda_zip[each.key].output_base64sha256

  environment {
    variables = {
      TABLE_NAME = var.dynamodb_table_name
      # AWS_REGION is automatically provided by Lambda runtime
    }
  }

  tags = {
    Name        = "${var.project_name}-${each.key}-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }

  depends_on = [
    aws_iam_role_policy.lambda_dynamodb
  ]
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "api" {
  name        = "${var.project_name}-api-${var.environment}"
  description = "Expense Tracker API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name        = "${var.project_name}-api-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# API Gateway Resource - /expenses
resource "aws_api_gateway_resource" "expenses" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "expenses"
}

# API Gateway Resource - /expenses/{id}
resource "aws_api_gateway_resource" "expense" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.expenses.id
  path_part   = "{id}"
}

# API Gateway Methods
resource "aws_api_gateway_method" "get_expenses" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.expenses.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "create_expense" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.expenses.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "update_expense" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.expense.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "delete_expense" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.expense.id
  http_method   = "DELETE"
  authorization = "NONE"
}

# API Gateway Integrations
resource "aws_api_gateway_integration" "get_expenses" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.expenses.id
  http_method = aws_api_gateway_method.get_expenses.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.expenses_api["get-expenses"].invoke_arn
}

resource "aws_api_gateway_integration" "create_expense" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.expenses.id
  http_method = aws_api_gateway_method.create_expense.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.expenses_api["create-expense"].invoke_arn
}

resource "aws_api_gateway_integration" "update_expense" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.expense.id
  http_method = aws_api_gateway_method.update_expense.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.expenses_api["update-expense"].invoke_arn
}

resource "aws_api_gateway_integration" "delete_expense" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.expense.id
  http_method = aws_api_gateway_method.delete_expense.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.expenses_api["delete-expense"].invoke_arn
}

# Lambda Permissions
resource "aws_lambda_permission" "api_gateway" {
  for_each = local.lambda_functions

  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.expenses_api[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_method.get_expenses.id,
      aws_api_gateway_method.create_expense.id,
      aws_api_gateway_method.update_expense.id,
      aws_api_gateway_method.delete_expense.id,
      aws_api_gateway_integration.get_expenses.id,
      aws_api_gateway_integration.create_expense.id,
      aws_api_gateway_integration.update_expense.id,
      aws_api_gateway_integration.delete_expense.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway Stage
resource "aws_api_gateway_stage" "api" {
  deployment_id = aws_api_gateway_deployment.api.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = var.environment

  # Access logging (commented out - requires CloudWatch Logs role to be configured)
  # To enable: Configure API Gateway CloudWatch Logs role in AWS Console first
  # access_log_settings {
  #   destination_arn = aws_cloudwatch_log_group.api_gateway.arn
  #   format = jsonencode({
  #     requestId      = "$context.requestId"
  #     ip             = "$context.identity.sourceIp"
  #     requestTime    = "$context.requestTime"
  #     httpMethod     = "$context.httpMethod"
  #     resourcePath   = "$context.resourcePath"
  #     status         = "$context.status"
  #     protocol       = "$context.protocol"
  #     responseLength = "$context.responseLength"
  #   })
  # }

  tags = {
    Name        = "${var.project_name}-api-stage-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.project_name}-${var.environment}"
  retention_in_days = 14

  tags = {
    Name        = "${var.project_name}-api-gateway-logs"
    Environment = var.environment
    Project     = var.project_name
  }
}

# WAF Association (if WAF is enabled)
resource "aws_wafv2_web_acl_association" "api" {
  count = var.enable_waf ? 1 : 0

  resource_arn = aws_api_gateway_stage.api.arn
  web_acl_arn  = var.waf_web_acl_arn
}

# CORS Configuration
resource "aws_api_gateway_method" "options_expenses" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.expenses.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_expenses" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.expenses.id
  http_method = aws_api_gateway_method.options_expenses.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "options_expenses" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.expenses.id
  http_method = aws_api_gateway_method.options_expenses.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_expenses" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.expenses.id
  http_method = aws_api_gateway_method.options_expenses.http_method
  status_code = aws_api_gateway_method_response.options_expenses.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Local values
locals {
  lambda_functions = {
    "get-expenses"    = {}
    "create-expense"  = {}
    "update-expense"  = {}
    "delete-expense"  = {}
  }
}

