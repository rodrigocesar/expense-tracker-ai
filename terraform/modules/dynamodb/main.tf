resource "aws_dynamodb_table" "expenses" {
  name           = "${var.project_name}-expenses-${var.environment}"
  billing_mode   = var.billing_mode
  hash_key       = "userId"
  range_key      = "expenseId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "expenseId"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  # Global Secondary Index for date-based queries
  global_secondary_index {
    name            = "DateIndex"
    hash_key        = "userId"
    range_key       = "date"
    projection_type = "ALL"
  }

  # Server-side encryption
  server_side_encryption {
    enabled     = true
    kms_key_id  = null # Uses AWS managed key
  }

  # Point-in-time recovery
  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  # Tags
  tags = {
    Name        = "${var.project_name}-expenses-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
  }

  # Stream configuration for future use (optional)
  # stream_enabled   = true
  # stream_view_type = "NEW_AND_OLD_IMAGES"
}

