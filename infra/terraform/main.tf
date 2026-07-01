data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  name = "${var.project}-${var.environment}"
  azs  = slice(data.aws_availability_zones.available.names, 0, 2)

  backend_port  = 4000
  frontend_port = 3000

  backend_image  = var.backend_image != "" ? var.backend_image : "${aws_ecr_repository.backend.repository_url}:latest"
  frontend_image = var.frontend_image != "" ? var.frontend_image : "${aws_ecr_repository.frontend.repository_url}:latest"

  database_url = "postgres://${var.db_username}:${random_password.db.result}@${aws_db_instance.postgres.address}:5432/${var.db_name}"
}

# ---------------------------------------------------------------------------
# Networking
# ---------------------------------------------------------------------------
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.8"

  name = "${local.name}-vpc"
  cidr = var.vpc_cidr
  azs  = local.azs

  public_subnets  = [for i in range(2) : cidrsubnet(var.vpc_cidr, 8, i)]
  private_subnets = [for i in range(2) : cidrsubnet(var.vpc_cidr, 8, i + 10)]

  # No NAT gateway: it's the single biggest line item (~$32/mo) and this is a
  # cost-sensitive demo. Instead, the Fargate tasks run in public subnets with a
  # public IP for outbound (ECR pulls, OpenAI). RDS stays in the private subnets
  # (it never needs the internet). See the "AWS cost note" in the README.
  enable_nat_gateway   = false
  single_nat_gateway   = false
  enable_dns_hostnames = true
  enable_dns_support   = true
}

# ---------------------------------------------------------------------------
# Container registry
# ---------------------------------------------------------------------------
resource "aws_ecr_repository" "backend" {
  name                 = "${local.name}-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "${local.name}-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
  image_scanning_configuration {
    scan_on_push = true
  }
}

# ---------------------------------------------------------------------------
# S3 — audio storage
# ---------------------------------------------------------------------------
resource "aws_s3_bucket" "audio" {
  bucket        = "${local.name}-audio"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "audio" {
  bucket                  = aws_s3_bucket.audio.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "audio" {
  bucket = aws_s3_bucket.audio.id
  cors_rule {
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# ---------------------------------------------------------------------------
# Secrets
# ---------------------------------------------------------------------------
resource "random_password" "db" {
  length  = 24
  special = false
}

resource "aws_secretsmanager_secret" "database_url" {
  name                    = "${local.name}/database-url"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = local.database_url
}

resource "aws_secretsmanager_secret" "openai" {
  count                   = var.openai_api_key != "" ? 1 : 0
  name                    = "${local.name}/openai-api-key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "openai" {
  count         = var.openai_api_key != "" ? 1 : 0
  secret_id     = aws_secretsmanager_secret.openai[0].id
  secret_string = var.openai_api_key
}

# ---------------------------------------------------------------------------
# RDS Postgres
# ---------------------------------------------------------------------------
resource "aws_db_subnet_group" "postgres" {
  name       = "${local.name}-db"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "rds" {
  name        = "${local.name}-rds"
  description = "Postgres access from ECS tasks"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "Postgres from ECS services"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.service.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "postgres" {
  identifier              = "${local.name}-postgres"
  engine                  = "postgres"
  engine_version          = "16"
  instance_class          = var.db_instance_class
  allocated_storage       = 20
  storage_type            = "gp3"
  db_name                 = var.db_name
  username                = var.db_username
  password                = random_password.db.result
  db_subnet_group_name    = aws_db_subnet_group.postgres.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  skip_final_snapshot     = true
  deletion_protection     = false
  publicly_accessible     = false
  backup_retention_period = 1
  apply_immediately       = true
}

# ---------------------------------------------------------------------------
# Load balancer + security groups
# ---------------------------------------------------------------------------
resource "aws_security_group" "alb" {
  name        = "${local.name}-alb"
  description = "Public ingress to the ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "service" {
  name        = "${local.name}-service"
  description = "ECS tasks: traffic from the ALB only"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "From ALB"
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "this" {
  name               = "${local.name}-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  # Replaced by service listener rules; this is a safety fallback.
  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not found"
      status_code  = "404"
    }
  }
}

# ---------------------------------------------------------------------------
# ECS cluster + IAM
# ---------------------------------------------------------------------------
resource "aws_ecs_cluster" "this" {
  name = "${local.name}-cluster"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

data "aws_iam_policy_document" "ecs_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "execution" {
  name               = "${local.name}-exec"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy_attachment" "execution" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Allow the execution role to read the secrets injected into containers.
data "aws_iam_policy_document" "exec_secrets" {
  statement {
    actions = ["secretsmanager:GetSecretValue"]
    resources = concat(
      [aws_secretsmanager_secret.database_url.arn],
      var.openai_api_key != "" ? [aws_secretsmanager_secret.openai[0].arn] : [],
    )
  }
}

resource "aws_iam_role_policy" "exec_secrets" {
  name   = "secrets-access"
  role   = aws_iam_role.execution.id
  policy = data.aws_iam_policy_document.exec_secrets.json
}

# Task role for the backend — needs S3 access to store/read audio.
resource "aws_iam_role" "backend_task" {
  name               = "${local.name}-backend-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

data "aws_iam_policy_document" "backend_s3" {
  statement {
    actions   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.audio.arn}/*"]
  }
  statement {
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.audio.arn]
  }
}

resource "aws_iam_role_policy" "backend_s3" {
  name   = "audio-bucket-access"
  role   = aws_iam_role.backend_task.id
  policy = data.aws_iam_policy_document.backend_s3.json
}

resource "aws_iam_role" "frontend_task" {
  name               = "${local.name}-frontend-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

# ---------------------------------------------------------------------------
# Services
# ---------------------------------------------------------------------------
module "backend" {
  source = "./modules/fargate-service"

  name                      = "${local.name}-backend"
  cluster_arn               = aws_ecs_cluster.this.arn
  region                    = var.aws_region
  vpc_id                    = module.vpc.vpc_id
  subnet_ids                = module.vpc.public_subnets
  assign_public_ip          = true
  service_security_group_id = aws_security_group.service.id
  execution_role_arn        = aws_iam_role.execution.arn
  task_role_arn             = aws_iam_role.backend_task.arn

  image          = local.backend_image
  container_port = local.backend_port
  desired_count  = var.backend_desired_count

  environment = {
    NODE_ENV             = "production"
    PORT                 = tostring(local.backend_port)
    DATABASE_SYNCHRONIZE = "true"
    DATABASE_RUN_SEED    = "true"
    CORS_ORIGIN          = "*"
    AWS_REGION           = var.aws_region
    S3_BUCKET            = aws_s3_bucket.audio.bucket
    AI_PROVIDER          = var.ai_provider
  }

  secrets = merge(
    { DATABASE_URL = aws_secretsmanager_secret.database_url.arn },
    var.openai_api_key != "" ? { OPENAI_API_KEY = aws_secretsmanager_secret.openai[0].arn } : {},
  )

  alb_listener_arn       = aws_lb_listener.http.arn
  health_check_path      = "/api/health"
  listener_rule_priority = 10
  path_patterns          = ["/api/*", "/docs", "/docs/*"]
}

module "frontend" {
  source = "./modules/fargate-service"

  name                      = "${local.name}-frontend"
  cluster_arn               = aws_ecs_cluster.this.arn
  region                    = var.aws_region
  vpc_id                    = module.vpc.vpc_id
  subnet_ids                = module.vpc.public_subnets
  assign_public_ip          = true
  service_security_group_id = aws_security_group.service.id
  execution_role_arn        = aws_iam_role.execution.arn
  task_role_arn             = aws_iam_role.frontend_task.arn

  image          = local.frontend_image
  container_port = local.frontend_port
  desired_count  = var.frontend_desired_count

  environment = {
    NODE_ENV = "production"
    # The browser calls the backend same-origin via /api (ALB path routing),
    # so the public base is built empty (see deploy workflow build-arg).
    # Server components use this absolute internal URL during SSR.
    API_BASE_URL_INTERNAL = "http://${aws_lb.this.dns_name}"
  }

  alb_listener_arn       = aws_lb_listener.http.arn
  health_check_path      = "/"
  listener_rule_priority = 100
  is_default             = true
}
