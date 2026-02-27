resource "aws_ecr_repository" "shopping_model" {
  name                 = "shopping_model"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}