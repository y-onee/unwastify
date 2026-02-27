# IAM role for CodePipeline
resource "aws_iam_role" "codepipeline_role" {
  name = "unwastify-codepipeline-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "codepipeline.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "codepipeline_policy" {
  name = "codepipeline_policy"
  role = aws_iam_role.codepipeline_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:*",
          "codebuild:*",
          "codestar-connections:UseConnection"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM role for CodeBuild
resource "aws_iam_role" "codebuild_role" {
  name = "unwastify-codebuild-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "codebuild.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "codebuild_policy" {
  name = "codebuild_policy"
  role = aws_iam_role.codebuild_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "*"
        Resource = "*"
      }
    ]
  })
}

# GitHub connection
resource "aws_codestarconnections_connection" "github" {
  name          = "unwastify-github"
  provider_type = "GitHub"
}

# CodeBuild project
resource "aws_codebuild_project" "unwastify" {
  name         = "unwastify-build"
  service_role = aws_iam_role.codebuild_role.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type = "BUILD_GENERAL1_SMALL"
    image        = "aws/codebuild/standard:7.0"
    type         = "LINUX_CONTAINER"
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "buildspec.yml"
  }

  logs_config {
    s3_logs {
      status   = "ENABLED"
      location = "${aws_s3_bucket.logs_bucket.bucket}/codebuild-logs"
    }
  }
}

# CodePipeline
resource "aws_codepipeline" "unwastify" {
  name          = "unwastify-pipeline"
  role_arn      = aws_iam_role.codepipeline_role.arn
  pipeline_type = "V2"

  trigger {
    provider_type = "CodeStarSourceConnection"
    git_configuration {
      source_action_name = "Source"
      push {
        branches {
          includes = ["main"]
        }
      }
    }
  }

  artifact_store {
    location = aws_s3_bucket.app_bucket.bucket
    type     = "S3"
  }

  execution_mode = "QUEUED"
  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["source_output"]

      configuration = {
        ConnectionArn    = aws_codestarconnections_connection.github.arn
        FullRepositoryId = "y-onee/unwastify"
        BranchName       = "main"
        DetectChanges    = "false"
      }
    }
  }

  stage {
    name = "Build"

    action {
      name             = "Build"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]

      configuration = {
        ProjectName = aws_codebuild_project.unwastify.name
      }
    }
  }
}

# EventBridge rule to trigger pipeline on GitHub push
resource "aws_cloudwatch_event_rule" "pipeline_trigger" {
  name        = "unwastify-pipeline-trigger"
  description = "Trigger CodePipeline on GitHub push to main"

  event_pattern = jsonencode({
    source        = ["aws.codestar-connections"]
    "detail-type" = ["CodeConnection Repository Push Event"]
    detail = {
      connectionArn = [aws_codestarconnections_connection.github.arn]
      referenceName = ["main"]
      referenceType = ["branch"]
    }
  })
}

resource "aws_cloudwatch_event_target" "pipeline_target" {
  rule     = aws_cloudwatch_event_rule.pipeline_trigger.name
  arn      = aws_codepipeline.unwastify.arn
  role_arn = aws_iam_role.codepipeline_role.arn
}

#change to check pipeline trigger