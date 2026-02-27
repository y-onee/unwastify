data "archive_file" "common_utils_zip" {
  type        = "zip"
  source_dir  = "${path.module}/layers/common_utils"
  output_path = "${path.module}/common_utils.zip"
}

resource "aws_lambda_layer_version" "common_utils" {
  filename            = data.archive_file.common_utils_zip.output_path
  layer_name          = "common_pantry_utils"
  compatible_runtimes = ["python3.10", "python3.11", "python3.12", "python3.13"]

  source_code_hash = data.archive_file.common_utils_zip.output_base64sha256
}