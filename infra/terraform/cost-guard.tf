# Hard-stop: when the monthly budget hits 100%, the budget publishes to an SNS
# topic that triggers a Lambda which scales the ECS services to 0 and stops RDS.
# (The ALB keeps billing until `terraform destroy` — see budget.tf.)

data "aws_caller_identity" "current" {}

# ---- Lambda that does the stopping ----
data "archive_file" "cost_guard" {
  type        = "zip"
  source_file = "${path.module}/cost-guard/handler.py"
  output_path = "${path.module}/cost-guard/handler.zip"
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "cost_guard" {
  name               = "${local.name}-cost-guard"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "cost_guard_logs" {
  role       = aws_iam_role.cost_guard.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "cost_guard" {
  statement {
    actions   = ["ecs:UpdateService", "ecs:DescribeServices"]
    resources = ["*"]
  }
  statement {
    actions   = ["rds:StopDBInstance"]
    resources = [aws_db_instance.postgres.arn]
  }
}

resource "aws_iam_role_policy" "cost_guard" {
  name   = "stop-resources"
  role   = aws_iam_role.cost_guard.id
  policy = data.aws_iam_policy_document.cost_guard.json
}

resource "aws_lambda_function" "cost_guard" {
  function_name    = "${local.name}-cost-guard"
  role             = aws_iam_role.cost_guard.arn
  runtime          = "python3.12"
  handler          = "handler.handler"
  filename         = data.archive_file.cost_guard.output_path
  source_code_hash = data.archive_file.cost_guard.output_base64sha256
  timeout          = 30

  environment {
    variables = {
      CLUSTER     = aws_ecs_cluster.this.name
      SERVICES    = "${module.backend.service_name},${module.frontend.service_name}"
      DB_INSTANCE = aws_db_instance.postgres.identifier
    }
  }
}

# ---- SNS topic the budget publishes to ----
resource "aws_sns_topic" "cost_guard" {
  name = "${local.name}-cost-guard"
}

data "aws_iam_policy_document" "cost_guard_topic" {
  statement {
    actions   = ["SNS:Publish"]
    resources = [aws_sns_topic.cost_guard.arn]
    principals {
      type        = "Service"
      identifiers = ["budgets.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [data.aws_caller_identity.current.account_id]
    }
  }
}

resource "aws_sns_topic_policy" "cost_guard" {
  arn    = aws_sns_topic.cost_guard.arn
  policy = data.aws_iam_policy_document.cost_guard_topic.json
}

resource "aws_sns_topic_subscription" "cost_guard" {
  topic_arn = aws_sns_topic.cost_guard.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.cost_guard.arn
}

resource "aws_lambda_permission" "cost_guard_sns" {
  statement_id  = "AllowSNSInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cost_guard.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.cost_guard.arn
}
