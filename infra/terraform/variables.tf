variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g. dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project" {
  description = "Project/name prefix for resources"
  type        = string
  default     = "scrai"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.20.0.0/16"
}

variable "db_name" {
  description = "Postgres database name"
  type        = string
  default     = "scrai"
}

variable "db_username" {
  description = "Postgres master username"
  type        = string
  default     = "scrai"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "backend_image" {
  description = "Full backend container image (repo:tag). Defaults to the created ECR repo + 'latest'."
  type        = string
  default     = ""
}

variable "frontend_image" {
  description = "Full frontend container image (repo:tag). Defaults to the created ECR repo + 'latest'."
  type        = string
  default     = ""
}

variable "backend_desired_count" {
  description = "Number of backend tasks"
  type        = number
  default     = 1
}

variable "frontend_desired_count" {
  description = "Number of frontend tasks"
  type        = number
  default     = 1
}

variable "openai_api_key" {
  description = "OpenAI API key (stored in Secrets Manager). Leave empty to run with the stub provider."
  type        = string
  default     = ""
  sensitive   = true
}

variable "ai_provider" {
  description = "AI provider for the backend: 'stub' or 'openai'"
  type        = string
  default     = "stub"
}
