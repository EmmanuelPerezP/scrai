output "alb_dns_name" {
  description = "Public URL of the application (frontend at /, API at /api, docs at /docs)"
  value       = "http://${aws_lb.this.dns_name}"
}

output "ecr_backend_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "backend_service_name" {
  value = module.backend.service_name
}

output "frontend_service_name" {
  value = module.frontend.service_name
}

output "audio_bucket" {
  value = aws_s3_bucket.audio.bucket
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.address
}
