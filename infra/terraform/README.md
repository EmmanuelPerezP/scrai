# ScrAI — AWS Infrastructure (Terraform)

Provisions everything needed to run ScrAI on AWS:

| Resource | Purpose |
| --- | --- |
| VPC (2 AZs, public + private subnets, **no NAT**) | Network isolation |
| ECR (backend, frontend) | Container image registries |
| RDS PostgreSQL 16 (`db.t4g.micro`) | Persistence, private subnets only |
| S3 bucket (`*-audio`) | Audio file storage (bonus requirement) |
| Secrets Manager | `DATABASE_URL`, optional `OPENAI_API_KEY` |
| ALB + 2 ECS Fargate services (public subnets, public IP) | `/api/*` & `/docs` → backend, `/*` → frontend |
| CloudWatch Logs | Per-service log groups |

> **No NAT gateway (cost).** Fargate tasks run in public subnets with a public
> IP for outbound access, saving the ~$32/mo a managed NAT gateway costs.
> Inbound is still gated by the tasks' security group (ALB only); RDS remains in
> private subnets. For production isolation, set `enable_nat_gateway = true` and
> move the services back to `module.vpc.private_subnets` with
> `assign_public_ip = false`.

The Next.js frontend is server-rendered, so it runs as a Fargate service (not
static S3). The browser calls the API same-origin under `/api`, which the ALB
routes to the backend — so no API URL needs to be baked into the frontend build
for AWS (build it with `NEXT_PUBLIC_API_BASE_URL=""`).

## Prerequisites

- Terraform >= 1.5, AWS credentials with admin-ish permissions
- Docker images pushed to the ECR repos (the GitHub Actions `deploy` workflow
  does this; see `.github/workflows/deploy.yml`)

## Bootstrapping order

Because services reference ECR images that don't exist on the very first apply,
do a two-step bootstrap (the CI workflow automates this):

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # edit as needed

terraform init

# 1) Create the registries + network + data stores first.
terraform apply -target=aws_ecr_repository.backend -target=aws_ecr_repository.frontend

# 2) Build & push images to those repos (see root README / deploy workflow), then:
terraform apply
```

After apply, open the `alb_dns_name` output in a browser.

## Notes / shortcuts

- `DATABASE_SYNCHRONIZE=true` and `DATABASE_RUN_SEED=true` are set on the backend
  task so the schema is created and mock patients are seeded on first boot. For a
  real production system you'd switch to TypeORM migrations.
- No NAT gateway (tasks in public subnets) and `db.t4g.micro` keep costs low;
  scale up / re-add NAT via variables and `enable_nat_gateway`.
- HTTP only (no ACM/HTTPS) to keep the example self-contained. Add an ACM cert +
  443 listener for production.
- State is local by default. Uncomment the S3 backend in `versions.tf` for teams.
