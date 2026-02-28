resource "aws_api_gateway_rest_api" "shopping_api" {
  name = "shopping_api"
}

# Add to Pantry
resource "aws_api_gateway_resource" "add_to_pantry" {
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  parent_id   = aws_api_gateway_rest_api.shopping_api.root_resource_id
  path_part   = "add_to_pantry"
}

resource "aws_api_gateway_method" "add_to_pantry_method" {
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  resource_id   = aws_api_gateway_resource.add_to_pantry.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "add_to_pantry_integration" {
  rest_api_id             = aws_api_gateway_rest_api.shopping_api.id
  resource_id             = aws_api_gateway_resource.add_to_pantry.id
  http_method             = aws_api_gateway_method.add_to_pantry_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.add_to_pantry.invoke_arn
}

resource "aws_lambda_permission" "add_to_pantry_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.add_to_pantry.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.shopping_api.execution_arn}/*/*"
}


# Delete Pantry Item
resource "aws_api_gateway_resource" "delete_pantry_item" {
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  parent_id   = aws_api_gateway_rest_api.shopping_api.root_resource_id
  path_part   = "delete_pantry_item"
}

resource "aws_api_gateway_method" "delete_pantry_item_method" {
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  resource_id   = aws_api_gateway_resource.delete_pantry_item.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "delete_pantry_item_integration" {
  rest_api_id             = aws_api_gateway_rest_api.shopping_api.id
  resource_id             = aws_api_gateway_resource.delete_pantry_item.id
  http_method             = aws_api_gateway_method.delete_pantry_item_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.delete_pantry_item.invoke_arn
}

resource "aws_lambda_permission" "delete_pantry_item_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_pantry_item.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.shopping_api.execution_arn}/*/*"
}


# Delete Shopping List Item
resource "aws_api_gateway_resource" "delete_shopping_item" {
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  parent_id   = aws_api_gateway_rest_api.shopping_api.root_resource_id
  path_part   = "delete_shopping_item"
}

resource "aws_api_gateway_method" "delete_shopping_item_method" {
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  resource_id   = aws_api_gateway_resource.delete_shopping_item.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "delete_shopping_item_integration" {
  rest_api_id             = aws_api_gateway_rest_api.shopping_api.id
  resource_id             = aws_api_gateway_resource.delete_shopping_item.id
  http_method             = aws_api_gateway_method.delete_shopping_item_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.delete_shopping_item.invoke_arn
}

resource "aws_lambda_permission" "delete_shopping_item_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_shopping_item.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.shopping_api.execution_arn}/*/*"
}


# Generate Shopping List
resource "aws_api_gateway_resource" "generate_shopping_list" {
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  parent_id   = aws_api_gateway_rest_api.shopping_api.root_resource_id
  path_part   = "generate_shopping_list"
}

resource "aws_api_gateway_method" "generate_shopping_list_method" {
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  resource_id   = aws_api_gateway_resource.generate_shopping_list.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "generate_shopping_list_integration" {
  rest_api_id             = aws_api_gateway_rest_api.shopping_api.id
  resource_id             = aws_api_gateway_resource.generate_shopping_list.id
  http_method             = aws_api_gateway_method.generate_shopping_list_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.generate_shopping_list.invoke_arn
}

resource "aws_lambda_permission" "generate_shopping_list_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generate_shopping_list.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.shopping_api.execution_arn}/*/*"
}


# Get Pantry
resource "aws_api_gateway_resource" "get_pantry" {
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  parent_id   = aws_api_gateway_rest_api.shopping_api.root_resource_id
  path_part   = "get_pantry"
}

resource "aws_api_gateway_method" "get_pantry_method" {
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  resource_id   = aws_api_gateway_resource.get_pantry.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_pantry_integration" {
  rest_api_id             = aws_api_gateway_rest_api.shopping_api.id
  resource_id             = aws_api_gateway_resource.get_pantry.id
  http_method             = aws_api_gateway_method.get_pantry_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_pantry.invoke_arn
}

resource "aws_lambda_permission" "get_pantry_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_pantry.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.shopping_api.execution_arn}/*/*"
}


# Get Shopping List
resource "aws_api_gateway_resource" "get_shopping_list" {
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  parent_id   = aws_api_gateway_rest_api.shopping_api.root_resource_id
  path_part   = "get_shopping_list"
}

resource "aws_api_gateway_method" "get_shopping_list_method" {
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  resource_id   = aws_api_gateway_resource.get_shopping_list.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_shopping_list_integration" {
  rest_api_id             = aws_api_gateway_rest_api.shopping_api.id
  resource_id             = aws_api_gateway_resource.get_shopping_list.id
  http_method             = aws_api_gateway_method.get_shopping_list_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_shopping_list.invoke_arn
}

resource "aws_lambda_permission" "get_shopping_list_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_shopping_list.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.shopping_api.execution_arn}/*/*"
}

# Mark as Bought
resource "aws_api_gateway_resource" "mark_as_bought" {
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  parent_id   = aws_api_gateway_rest_api.shopping_api.root_resource_id
  path_part   = "mark_as_bought"
}

resource "aws_api_gateway_method" "mark_as_bought_method" {
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  resource_id   = aws_api_gateway_resource.mark_as_bought.id
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "mark_as_bought_integration" {
  rest_api_id             = aws_api_gateway_rest_api.shopping_api.id
  resource_id             = aws_api_gateway_resource.mark_as_bought.id
  http_method             = aws_api_gateway_method.mark_as_bought_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.mark_as_bought.invoke_arn
}

resource "aws_lambda_permission" "mark_as_bought_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.mark_as_bought.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.shopping_api.execution_arn}/*/*"
}

# Mark Expired

resource "aws_api_gateway_resource" "mark_expired" {
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  parent_id   = aws_api_gateway_rest_api.shopping_api.root_resource_id
  path_part   = "mark_expired"
}

resource "aws_api_gateway_method" "mark_expired_method" {
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  resource_id   = aws_api_gateway_resource.mark_expired.id
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "mark_expired_integration" {
  rest_api_id             = aws_api_gateway_rest_api.shopping_api.id
  resource_id             = aws_api_gateway_resource.mark_expired.id
  http_method             = aws_api_gateway_method.mark_expired_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.mark_expired.invoke_arn
}

resource "aws_lambda_permission" "mark_expired_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.mark_expired.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.shopping_api.execution_arn}/*/*"
}


# Mark Wasted

resource "aws_api_gateway_resource" "mark_wasted" {
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  parent_id   = aws_api_gateway_rest_api.shopping_api.root_resource_id
  path_part   = "mark_wasted"
}

resource "aws_api_gateway_method" "mark_wasted_method" {
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  resource_id   = aws_api_gateway_resource.mark_wasted.id
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "mark_wasted_integration" {
  rest_api_id             = aws_api_gateway_rest_api.shopping_api.id
  resource_id             = aws_api_gateway_resource.mark_wasted.id
  http_method             = aws_api_gateway_method.mark_wasted_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.mark_wasted.invoke_arn
}

resource "aws_lambda_permission" "mark_wasted_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.mark_wasted.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.shopping_api.execution_arn}/*/*"
}


# Update family Info

resource "aws_api_gateway_resource" "update_family_info" {
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  parent_id   = aws_api_gateway_rest_api.shopping_api.root_resource_id
  path_part   = "update_family_info"
}

resource "aws_api_gateway_method" "update_family_info_method" {
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  resource_id   = aws_api_gateway_resource.update_family_info.id
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "update_family_info_integration" {
  rest_api_id             = aws_api_gateway_rest_api.shopping_api.id
  resource_id             = aws_api_gateway_resource.update_family_info.id
  http_method             = aws_api_gateway_method.update_family_info_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.update_family_info.invoke_arn
}

resource "aws_lambda_permission" "update_family_info_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_family_info.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.shopping_api.execution_arn}/*/*"
}

# Get Family Info

resource "aws_api_gateway_resource" "get_family_info" {
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  parent_id   = aws_api_gateway_rest_api.shopping_api.root_resource_id
  path_part   = "get_family_info"
}

resource "aws_api_gateway_method" "get_family_info_method" {
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  resource_id   = aws_api_gateway_resource.get_family_info.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_family_info_integration" {
  rest_api_id             = aws_api_gateway_rest_api.shopping_api.id
  resource_id             = aws_api_gateway_resource.get_family_info.id
  http_method             = aws_api_gateway_method.get_family_info_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_family_info.invoke_arn
}

resource "aws_lambda_permission" "get_family_info_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_family_info.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.shopping_api.execution_arn}/*/*"
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.shopping_api.id
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  stage_name    = "prod"

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      resourcePath   = "$context.resourcePath"
      status         = "$context.status"
      responseLength = "$context.responseLength"
    })
  }

  depends_on = [aws_api_gateway_account.main]
}

resource "aws_api_gateway_authorizer" "cognito" {
  name          = "cognito_authorizer"
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [aws_cognito_user_pool.user_pool.arn]
}

resource "aws_api_gateway_gateway_response" "cors" {
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  response_type = "DEFAULT_4XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
  }
}

resource "aws_api_gateway_gateway_response" "cors_5xx" {
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  response_type = "DEFAULT_5XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
  }
}

# Deploy
resource "aws_api_gateway_deployment" "shopping_api" {
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_integration.add_to_pantry_integration,
      aws_api_gateway_integration.delete_pantry_item_integration,
      aws_api_gateway_integration.delete_shopping_item_integration,
      aws_api_gateway_integration.generate_shopping_list_integration,
      aws_api_gateway_integration.get_pantry_integration,
      aws_api_gateway_integration.get_shopping_list_integration,
      aws_api_gateway_integration.mark_as_bought_integration,
      aws_api_gateway_integration.mark_expired_integration,
      aws_api_gateway_integration.mark_wasted_integration,
      aws_api_gateway_integration.update_family_info_integration,
      aws_api_gateway_integration.get_family_info_integration,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.add_to_pantry_integration,
    aws_api_gateway_integration.delete_pantry_item_integration,
    aws_api_gateway_integration.delete_shopping_item_integration,
    aws_api_gateway_integration.generate_shopping_list_integration,
    aws_api_gateway_integration.get_pantry_integration,
    aws_api_gateway_integration.get_shopping_list_integration,
    aws_api_gateway_integration.mark_as_bought_integration,
    aws_api_gateway_integration.mark_expired_integration,
    aws_api_gateway_integration.mark_wasted_integration,
    aws_api_gateway_integration.update_family_info_integration,
    aws_api_gateway_integration.get_family_info_integration,
    aws_api_gateway_integration.options,
    aws_api_gateway_integration_response.options,
  ]
}

resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name              = "/aws/api-gateway/shopping_api"
  retention_in_days = 7
}

resource "aws_api_gateway_method_settings" "all" {
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  stage_name  = aws_api_gateway_stage.prod.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled = true
    logging_level   = "INFO"
  }
}