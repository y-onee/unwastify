# ML Model Lambda (Docker)
resource "aws_lambda_function" "shopping_model" {
  function_name = "shopping_model"
  role          = aws_iam_role.lambda_role.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.shopping_model.repository_url}:latest"
  timeout       = 30
  memory_size   = 512
}

# Add to Pantry
resource "aws_lambda_function" "add_to_pantry" {
  function_name    = "add_to_pantry"
  role             = aws_iam_role.lambda_role.arn
  handler          = "add_to_pantry.lambda_handler"
  runtime          = "python3.13"
  layers           = [aws_lambda_layer_version.common_utils.arn]
  filename         = "lambdas/add_to_pantry.zip"
  source_code_hash = filebase64sha256("lambdas/add_to_pantry.zip")
  timeout          = 30
  memory_size      = 256
}

# Delete Pantry Item
resource "aws_lambda_function" "delete_pantry_item" {
  function_name    = "delete_pantry_item"
  role             = aws_iam_role.lambda_role.arn
  handler          = "delete_pantry_item.lambda_handler"
  runtime          = "python3.13"
  layers           = [aws_lambda_layer_version.common_utils.arn]
  filename         = "lambdas/delete_pantry_item.zip"
  source_code_hash = filebase64sha256("lambdas/delete_pantry_item.zip")
  timeout          = 30
  memory_size      = 256
}

# Delete Shopping Item
resource "aws_lambda_function" "delete_shopping_item" {
  function_name    = "delete_shopping_item"
  role             = aws_iam_role.lambda_role.arn
  handler          = "delete_shopping_item.lambda_handler"
  runtime          = "python3.13"
  layers           = [aws_lambda_layer_version.common_utils.arn]
  filename         = "lambdas/delete_shopping_item.zip"
  source_code_hash = filebase64sha256("lambdas/delete_shopping_item.zip")
  timeout          = 30
  memory_size      = 256
}

# Shopping List Generator
resource "aws_lambda_function" "generate_shopping_list" {
  function_name    = "generate_shopping_list"
  role             = aws_iam_role.lambda_role.arn
  handler          = "generate_shopping_list.lambda_handler"
  runtime          = "python3.13"
  layers           = [aws_lambda_layer_version.common_utils.arn]
  filename         = "lambdas/generate_shopping_list.zip"
  source_code_hash = filebase64sha256("lambdas/generate_shopping_list.zip")
  timeout          = 30
  memory_size      = 256
}

# Get Pantry
resource "aws_lambda_function" "get_pantry" {
  function_name    = "get_pantry"
  role             = aws_iam_role.lambda_role.arn
  handler          = "get_pantry.lambda_handler"
  runtime          = "python3.13"
  layers           = [aws_lambda_layer_version.common_utils.arn]
  filename         = "lambdas/get_pantry.zip"
  source_code_hash = filebase64sha256("lambdas/get_pantry.zip")
  timeout          = 30
  memory_size      = 256
}

# Get Shopping List
resource "aws_lambda_function" "get_shopping_list" {
  function_name    = "get_shopping_list"
  role             = aws_iam_role.lambda_role.arn
  handler          = "get_shopping_list.lambda_handler"
  runtime          = "python3.13"
  layers           = [aws_lambda_layer_version.common_utils.arn]
  filename         = "lambdas/get_shopping_list.zip"
  source_code_hash = filebase64sha256("lambdas/get_shopping_list.zip")
  timeout          = 30
  memory_size      = 256
}

# Mark as Bought
resource "aws_lambda_function" "mark_as_bought" {
  function_name    = "mark_as_bought"
  role             = aws_iam_role.lambda_role.arn
  handler          = "mark_as_bought.lambda_handler"
  runtime          = "python3.13"
  layers           = [aws_lambda_layer_version.common_utils.arn]
  filename         = "lambdas/mark_as_bought.zip"
  source_code_hash = filebase64sha256("lambdas/mark_as_bought.zip")
  timeout          = 30
  memory_size      = 256
}

# Mark Expired
resource "aws_lambda_function" "mark_expired" {
  function_name    = "mark_expired"
  role             = aws_iam_role.lambda_role.arn
  handler          = "mark_expired.lambda_handler"
  runtime          = "python3.13"
  layers           = [aws_lambda_layer_version.common_utils.arn]
  filename         = "lambdas/mark_expired.zip"
  source_code_hash = filebase64sha256("lambdas/mark_expired.zip")
  timeout          = 30
  memory_size      = 256
}

# Mark Wasted
resource "aws_lambda_function" "mark_wasted" {
  function_name    = "mark_wasted"
  role             = aws_iam_role.lambda_role.arn
  handler          = "mark_wasted.lambda_handler"
  runtime          = "python3.13"
  layers           = [aws_lambda_layer_version.common_utils.arn]
  filename         = "lambdas/mark_wasted.zip"
  source_code_hash = filebase64sha256("lambdas/mark_wasted.zip")
  timeout          = 30
  memory_size      = 256
}


# Get Family Info
resource "aws_lambda_function" "get_family_info" {
  function_name    = "get_family_info"
  role             = aws_iam_role.lambda_role.arn
  handler          = "get_family_info.lambda_handler"
  runtime          = "python3.13"
  layers           = [aws_lambda_layer_version.common_utils.arn]
  filename         = "lambdas/get_family_info.zip"
  source_code_hash = filebase64sha256("lambdas/get_family_info.zip")
  timeout          = 30
  memory_size      = 256
}

# Update Family Info
resource "aws_lambda_function" "update_family_info" {
  function_name    = "update_family_info"
  role             = aws_iam_role.lambda_role.arn
  handler          = "update_family_info.lambda_handler"
  runtime          = "python3.13"
  layers           = [aws_lambda_layer_version.common_utils.arn]
  filename         = "lambdas/update_family_info.zip"
  source_code_hash = filebase64sha256("lambdas/update_family_info.zip")
  timeout          = 30
  memory_size      = 256
}

resource "aws_lambda_function" "mark_consumed" {
  function_name    = "mark_consumed"
  role             = aws_iam_role.lambda_role.arn
  handler          = "mark_consumed.lambda_handler"
  runtime          = "python3.13"
  layers           = [aws_lambda_layer_version.common_utils.arn]
  filename         = "lambdas/mark_consumed.zip"
  source_code_hash = filebase64sha256("lambdas/mark_consumed.zip")
  timeout          = 30
  memory_size      = 256
}

#post-registration function
resource "aws_lambda_function" "post_confirmation" {
  function_name    = "post_confirmation"
  role             = aws_iam_role.lambda_role.arn
  handler          = "post_confirmation.lambda_handler"
  runtime          = "python3.13"
  layers           = [aws_lambda_layer_version.common_utils.arn]
  filename         = "lambdas/post_confirmation.zip"
  source_code_hash = filebase64sha256("lambdas/post_confirmation.zip")
  timeout          = 30
  memory_size      = 256
}

resource "aws_lambda_permission" "cognito_post_confirmation" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_confirmation.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.user_pool.arn
}