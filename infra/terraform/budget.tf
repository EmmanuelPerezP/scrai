# Monthly cost budget with email alerts, so spend never surprises you.
# AWS has no hard spend cap — these are notifications (no resources are stopped).
# The real $0 lever between demos is `terraform destroy`.
#
# With the default $40 limit, alerts fire at:
#   - $20  (50% actual)
#   - $40  (100% actual)
#   - $40  (forecasted to exceed by month end)
resource "aws_budgets_budget" "monthly" {
  name         = "${local.name}-monthly"
  budget_type  = "COST"
  limit_amount = tostring(var.monthly_budget_usd)
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 50
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.budget_alert_email]
  }

  # At 100% ($40) also trigger the hard-stop Lambda via SNS (see cost-guard.tf).
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.budget_alert_email]
    subscriber_sns_topic_arns  = [aws_sns_topic.cost_guard.arn]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.budget_alert_email]
  }
}
