variable "name" { type = string }
variable "cluster_arn" { type = string }
variable "region" { type = string }

variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "assign_public_ip" {
  description = "Give tasks a public IP so they can reach the internet without a NAT gateway"
  type        = bool
  default     = false
}
variable "service_security_group_id" { type = string }

variable "execution_role_arn" { type = string }
variable "task_role_arn" { type = string }

variable "image" { type = string }
variable "container_port" { type = number }
variable "cpu" {
  type    = number
  default = 256
}
variable "memory" {
  type    = number
  default = 512
}
variable "desired_count" {
  type    = number
  default = 1
}

variable "environment" {
  description = "Plain environment variables"
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "Secret env vars: name => secret ARN (optionally with :json-key::)"
  type        = map(string)
  default     = {}
}

# ALB wiring
variable "alb_listener_arn" { type = string }
variable "health_check_path" {
  type    = string
  default = "/"
}
variable "listener_rule_priority" { type = number }
variable "path_patterns" {
  description = "Path patterns this service should receive. Empty means default action (catch-all)."
  type        = list(string)
  default     = []
}
variable "is_default" {
  description = "If true, this service becomes the listener's default action (catch-all)."
  type        = bool
  default     = false
}

variable "log_retention_days" {
  type    = number
  default = 14
}
