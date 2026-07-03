# ScrAI — AI Scribe Notes Management Tool

A lightweight tool for creating and viewing AI-generated clinical notes
associated with patients. Notes can be **typed** or **uploaded as audio**;
audio is transcribed and (optionally) summarized into a SOAP note. Each note is
stored against a mock patient, and the UI lists notes and shows a note alongside
its patient details.

## Stack


| Layer      | Tech                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| Frontend   | Next.js 14 (App Router) + TypeScript                                   |
| Backend    | NestJS + TypeScript, REST, Swagger/OpenAPI                             |
| API client | Auto-generated TS client from the OpenAPI spec (`@scrai/api-client`)   |
| Database   | PostgreSQL via TypeORM                                                 |
| Storage    | S3 for audio (LocalStack locally, real S3 on AWS)                      |
| AI         | Pluggable `AiProcessor` — `stub` (default) or `openai` (Whisper + GPT) |
| Infra      | Terraform → AWS (VPC, RDS, ECR, ECS Fargate, ALB, S3, Secrets Manager) |
| CI/CD      | GitHub Actions (CI build/test + deploy to AWS)                         |


Monorepo managed with **pnpm workspaces**:

```
apps/
  backend/      NestJS API (patients, notes, AI, S3, Swagger, seed)
  frontend/     Next.js UI (list, detail + patient sidebar, new-note form)
packages/
  api-client/   Generated typed client (OpenAPI -> fetch client)
infra/
  terraform/    AWS infrastructure as code
.github/        CI + deploy workflows
docker-compose.yml
```

## Architecture at a glance

```
Browser ──/──▶ Next.js (SSR) ──┐
        ──/api──▶               ├─▶ NestJS API ─▶ PostgreSQL (TypeORM)
                                │                └▶ S3 (audio)
                                └▶ AiProcessor (stub | OpenAI Whisper+GPT)
```

- The backend exposes REST endpoints and a Swagger UI; its OpenAPI document is
the single source of truth for the typed client the frontend uses.
- AI work sits behind one `AiProcessor` interface, so swapping the stub for
OpenAI (or another provider) never touches controllers/services.
- In production the frontend and backend run behind one ALB; the browser calls
the API same-origin under `/api`.

For detailed diagrams — AWS deployment, component/data flow, the note-processing
sequence, the ER schema, and the note lifecycle — see
[`docs/architecture.md`](docs/architecture.md). A design proposal for adding
real-time speech-to-text ("Record live") is in
[`docs/live-transcription-design.md`](docs/live-transcription-design.md).

## Quick start (local)

Prereqs: Node 20+, pnpm 10+, Docker.

```bash
# 1. Install deps
pnpm install

# 2. Start Postgres + LocalStack (S3)
docker compose up -d postgres localstack

# 3. Create the local S3 bucket in LocalStack
docker compose exec localstack awslocal s3 mb s3://scrai-audio

# 4. Configure env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local

# 5. Generate the typed API client from the backend's OpenAPI spec
#    (boots the API briefly; Postgres must be up)
pnpm generate:api

# 6. Run backend + frontend together
pnpm dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:4000/api](http://localhost:4000/api)
- Swagger docs: [http://localhost:4000/docs](http://localhost:4000/docs)

The backend seeds 2–3 mock patients on first boot (idempotent).

### Or run the whole thing in Docker

```bash
pnpm install && pnpm generate:api      # generate the client first (compiled into the frontend image)
docker compose up --build
```

> The frontend image compiles the generated client, so `pnpm generate:api` must
> have produced `packages/api-client/src/generated` before building images.

## Core flows

1. **New note** (`/notes/new`): pick a seeded patient, choose *typed text* or
  *audio upload*, optionally request an AI SOAP summary, submit.
2. **List** (`/`): all notes with patient name, timestamp, source/status, and a
  preview.
3. **Detail** (`/notes/[id]`): transcription/summary plus a patient sidebar; if
  the note came from audio, a signed S3 URL lets you play it back.

## API


| Method | Path                | Description                                    |
| ------ | ------------------- | ---------------------------------------------- |
| GET    | `/api/patients`     | List patients                                  |
| GET    | `/api/patients/:id` | Get a patient                                  |
| POST   | `/api/patients`     | Create a patient                               |
| GET    | `/api/notes`        | List notes (with preview + patient)            |
| GET    | `/api/notes/:id`    | Get a note (with signed audio URL)             |
| POST   | `/api/notes/text`   | Create a note from typed text                  |
| POST   | `/api/notes/audio`  | Create a note from an audio upload (multipart) |
| GET    | `/api/health`       | Health probe                                   |


Interactive docs and the full schema live at `/docs`.

## AI processing

Both AI steps sit behind the `AiProcessor` interface
(`apps/backend/src/ai/ai.types.ts`), which has two methods: `transcribe(audio)`
and `summarize(rawText)`. The provider is chosen with `AI_PROVIDER`:

- **`stub`** (default): deterministic, dependency-free output so the entire
  vertical slice works with no API keys — used for local dev, tests, and CI.
- **`openai`**: the real implementation.
  - **Transcription** — OpenAI **Whisper** (`whisper-1`), configurable via
    `OPENAI_TRANSCRIBE_MODEL`.
  - **Summarization** — OpenAI **`gpt-4o-mini`** (configurable via
    `OPENAI_SUMMARY_MODEL`) with a strict clinical-scribe system prompt that
    produces a labelled SOAP note and is instructed not to invent findings.
  - Enable with `AI_PROVIDER=openai` and a single `OPENAI_API_KEY`.

> **Why single-vendor OpenAI?** Whisper handles the audio→text step (LLMs can't
> take raw audio); GPT-4o-mini handles text→SOAP. Keeping both on OpenAI means
> one API key and one bill. The interface makes swapping either step (e.g. Groq
> Whisper, Deepgram, or Anthropic Claude for the summary) a one-file change.
>
> The API key is supplied in the final credentials step.

## Deploy to AWS

See `[infra/terraform/README.md](infra/terraform/README.md)`. In short:
Terraform provisions a VPC, RDS Postgres, ECR, an ALB, two ECS Fargate services
(backend + frontend), an S3 audio bucket, and Secrets Manager. The
`Deploy to AWS` GitHub Action builds/pushes images and applies Terraform.

> **AWS cost note — no NAT gateway.** A managed NAT gateway is normally the
> single biggest line item (~$32/mo, always-on). To keep this demo cheap, the
> Fargate tasks instead run in **public subnets with a public IP** for outbound
> access (ECR image pulls, the OpenAI API). They're still not directly
> reachable: the tasks' security group only accepts inbound traffic from the
> ALB. RDS stays in **private subnets** (it never needs the internet). This
> trades a little network isolation for ~$15/2-weeks of savings; for a
> production/regulated setup, switch back to private subnets + a NAT gateway
> (or VPC endpoints for ECR/S3) — flip `enable_nat_gateway` back on in
> `infra/terraform/main.tf` and point the services at `module.vpc.private_subnets`
> with `assign_public_ip = false`.

## Assumptions & shortcuts

- `synchronize: true` + boot-time seeding instead of migrations (fine for this
scope; migrations would be the production path).
- Note processing is synchronous in the request; a queue/worker would be better
for large audio files in production.
- No auth — out of scope for the exercise.
- HTTP-only ALB (no TLS) to keep the IaC self-contained.
- The generated API client is git-ignored and produced from the spec on demand.

## Useful scripts


| Command                             | What it does                                        |
| ----------------------------------- | --------------------------------------------------- |
| `pnpm dev`                          | Run backend + frontend in watch mode                |
| `pnpm generate:api`                 | Regenerate OpenAPI spec + typed client              |
| `pnpm build`                        | Generate client, then build all packages            |
| `pnpm --filter @scrai/backend seed` | Re-run the patient seed                             |
| `pnpm -r test`                      | Run tests across the workspace                      |
| `docker compose up`                 | Run the full stack (Postgres, LocalStack, API, web) |


