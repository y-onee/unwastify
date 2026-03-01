locals {
  cors_resources = {
    get_pantry             = { id = aws_api_gateway_resource.get_pantry.id, method = "GET" }
    add_to_pantry          = { id = aws_api_gateway_resource.add_to_pantry.id, method = "POST" }
    delete_pantry_item     = { id = aws_api_gateway_resource.delete_pantry_item.id, method = "DELETE" }
    delete_shopping_item   = { id = aws_api_gateway_resource.delete_shopping_item.id, method = "DELETE" }
    generate_shopping_list = { id = aws_api_gateway_resource.generate_shopping_list.id, method = "GET" }
    get_shopping_list      = { id = aws_api_gateway_resource.get_shopping_list.id, method = "GET" }
    mark_consumed          = { id = aws_api_gateway_resource.mark_consumed.id, method = "PUT" }
    mark_as_bought         = { id = aws_api_gateway_resource.mark_as_bought.id, method = "PUT" }
    mark_expired           = { id = aws_api_gateway_resource.mark_expired.id, method = "PUT" }
    mark_wasted            = { id = aws_api_gateway_resource.mark_wasted.id, method = "PUT" }
    update_family_info     = { id = aws_api_gateway_resource.update_family_info.id, method = "PUT" }
    get_family_info        = { id = aws_api_gateway_resource.get_family_info.id, method = "GET" }
  }
}

resource "aws_api_gateway_method" "options" {
  for_each      = local.cors_resources
  rest_api_id   = aws_api_gateway_rest_api.shopping_api.id
  resource_id   = each.value.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options" {
  for_each    = local.cors_resources
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  resource_id = each.value.id
  http_method = aws_api_gateway_method.options[each.key].http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options" {
  for_each    = local.cors_resources
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  resource_id = each.value.id
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }

  depends_on = [
  aws_api_gateway_integration.options]
}

resource "aws_api_gateway_integration_response" "options" {
  for_each    = local.cors_resources
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  resource_id = each.value.id
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_method_response.options
  ]
}

# Add method responses for actual methods to handle CORS via Lambda responses (AWS_PROXY)
resource "aws_api_gateway_method_response" "cors_methods" {
  for_each    = local.cors_resources
  rest_api_id = aws_api_gateway_rest_api.shopping_api.id
  resource_id = each.value.id
  http_method = each.value.method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}