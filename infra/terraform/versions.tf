terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Remote state backend (required for CI so state persists across runs).
  # Partial config — bucket/key/region are supplied via `-backend-config`
  # flags in the deploy workflow (from the TF_STATE_BUCKET repo variable).
  # For local runs, either pass the same flags or run `terraform init -backend=false`.
  backend "s3" {}
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "scrai"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
