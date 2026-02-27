resource "aws_cognito_user_pool" "user_pool" {
  name = "shopping_user_pool"

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    # require_lowercase = true
    require_numbers = true
    # require_symbols   = true
  }

  auto_verified_attributes = ["email"]

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  lambda_config {
    post_confirmation = aws_lambda_function.post_confirmation.arn
  }
}

resource "aws_cognito_user_pool_client" "user_pool_client" {
  name         = "shopping_user_pool_client"
  user_pool_id = aws_cognito_user_pool.user_pool.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]
}
