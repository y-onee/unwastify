resource "aws_dynamodb_table" "user_details" {
  name         = "user_details"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"

  attribute {
    name = "user_id"
    type = "N"
  }
}

resource "aws_dynamodb_table" "shelf_life" {
  name         = "shelf_life"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "item_id"

  attribute {
    name = "item_id"
    type = "N"
  }
}