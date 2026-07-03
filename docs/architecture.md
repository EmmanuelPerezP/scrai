# ScrAI — Architecture & Data Model

AI clinical-scribe tool: turns typed text or recorded audio from a home visit into a
structured SOAP note. This document captures the system architecture, request/data
flow, the note-processing pipeline, and the database schema.

All diagrams below are [Mermaid](https://mermaid.js.org/) and render natively on GitHub.

- [1. System architecture (AWS)](#1-system-architecture-aws)
- [2. Application components & data flow](#2-application-components--data-flow)
- [3. Note-processing pipeline (sequence)](#3-note-processing-pipeline-sequence)
- [4. Database schema (ER)](#4-database-schema-er)
- [5. Note lifecycle (state)](#5-note-lifecycle-state)

---

## 1. System architecture (AWS)

Single ALB fronts two ECS Fargate services (Next.js frontend, NestJS backend) with
path-based routing. To keep the demo cheap there is **no NAT gateway** — tasks run in
public subnets with a public IP for outbound (ECR pulls, OpenAI). RDS stays private.

It's easier to read as two views: the **runtime request path**, and the
**operations** plane (how images ship and how spend is capped).

**Runtime topology** — request path and data stores:

```mermaid
flowchart TB
    user([Clinician<br/>Browser])

    subgraph aws["AWS us-east-1 · VPC (2 AZs)"]
        direction TB
        alb["Application<br/>Load Balancer<br/>HTTP :80"]

        subgraph public["Public subnets"]
            direction LR
            fe["frontend<br/>Next.js :3000"]
            be["backend<br/>NestJS :4000"]
        end

        subgraph private["Private subnets"]
            rds[("RDS PostgreSQL 16<br/>:5432 · TLS")]
        end

        s3[("S3<br/>audio bucket")]
        secrets["Secrets Manager<br/>db-url · openai-key"]
    end

    openai["OpenAI API<br/>Whisper + GPT-4o-mini"]

    user -->|HTTPS| alb
    alb -->|"/ (default)"| fe
    alb -->|"/api/*, /docs"| be
    be -->|SQL / TLS| rds
    be -->|put / get audio| s3
    be -->|read at boot| secrets
    be -->|transcribe / summarize| openai
```

**Operations** — deploy pipeline and the automatic cost guard:

```mermaid
flowchart TB
    gha["GitHub Actions<br/>OIDC deploy"]
    ecr["ECR<br/>image repos"]
    cluster["ECS Fargate<br/>frontend + backend"]
    rds[("RDS<br/>PostgreSQL")]

    subgraph guard["Cost guard — auto shutdown"]
        direction LR
        budget["AWS Budgets<br/>$20 / $40"]
        sns["SNS topic"]
        lambda["Lambda"]
    end

    gha -->|build &amp; push| ecr
    gha -->|terraform apply| cluster
    ecr -->|image pull| cluster
    budget -->|threshold breached| sns
    sns --> lambda
    lambda -->|desiredCount = 0| cluster
    lambda -->|stop instance| rds
```

**Routing (ALB listener rules).**

| Priority | Path patterns              | Target service      | Health check |
|----------|----------------------------|---------------------|--------------|
| 10       | `/api/*`, `/docs`, `/docs/*` | backend (:4000)     | `/api/health` |
| 100      | `/` (default)              | frontend (:3000)    | `/`          |

The browser calls the backend **same-origin** at `/api` (so no CORS in prod); the ALB
routes `/api/*` to the backend. During SSR the frontend reaches the backend via the
internal ALB DNS (`API_BASE_URL_INTERNAL`).

**Security groups.** ALB accepts `:80` from the internet → ECS `service` SG accepts all
TCP from the ALB SG only → RDS SG accepts `:5432` from the `service` SG only.

**Secrets.** `DATABASE_URL` and `OPENAI_API_KEY` live in Secrets Manager and are injected
into the backend container by the ECS execution role; the backend task role additionally
grants S3 access to the audio bucket.

---

## 2. Application components & data flow

Monorepo (pnpm workspaces): a Next.js SPA + marketing landing, a shared generated API
client (Orval → TanStack React Query hooks), and a NestJS backend with feature modules.

```mermaid
flowchart LR
    subgraph fe["Frontend — Next.js 14 (App Router)"]
        landing["/ landing"]
        app["/app SPA"]
        hooks["React Query hooks<br/>useListNotes · useGetNote<br/>useCreateTextNote · useCreateAudioNote"]
        mutator["fetch mutator<br/>(configureApiClient → /api)"]
        app --> hooks --> mutator
    end

    subgraph client["packages/api-client"]
        orval["Orval-generated<br/>hooks + models (from openapi.json)"]
    end

    subgraph be["Backend — NestJS"]
        nc["NotesController<br/>/api/notes"]
        pc["PatientsController<br/>/api/patients"]
        hc["HealthController<br/>/api/health"]
        ns["NotesService"]
        ps["PatientsService"]
        storage["StorageModule<br/>S3 (v3) / LocalStack"]
        ai["AiModule<br/>AiProcessor: Stub | OpenAI"]
        orm["TypeORM repositories"]
    end

    db[("PostgreSQL")]
    s3[("S3 audio")]
    openai["OpenAI"]

    mutator -->|"HTTP /api/*"| nc
    mutator -->|"HTTP /api/*"| pc
    hooks -.->|"generated from"| orval
    nc --> ns
    pc --> ps
    ns --> orm --> db
    ns --> storage --> s3
    ns --> ai --> openai
    ps --> orm
```

**API surface** (all under the `/api` global prefix; Swagger at `/docs`):

| Method | Route              | Purpose                                   |
|--------|--------------------|-------------------------------------------|
| GET    | `/api/health`      | Liveness probe                            |
| GET    | `/api/patients`    | List patients                             |
| GET    | `/api/patients/:id`| Get one patient                           |
| POST   | `/api/patients`    | Create patient                            |
| GET    | `/api/notes`               | List notes (with patient summary)           |
| GET    | `/api/notes/:id`           | Note detail — pure cacheable data           |
| GET    | `/api/notes/:id/audio`     | 302-redirect to a signed S3 URL for playback|
| POST   | `/api/notes/text`          | Create note from typed text                 |
| POST   | `/api/notes/audio/upload-url` | Presigned S3 PUT URL for direct upload   |
| POST   | `/api/notes/audio`         | Create note from an already-uploaded object |

The `AiProcessor` interface has two implementations selected by `AI_PROVIDER`:
`StubProcessor` (deterministic, no external calls) and `OpenAiProcessor`
(Whisper `whisper-1` for transcription + `gpt-4o-mini` for SOAP structuring).

---

## 3. Note-processing pipeline (sequence)

Both entry points create the note in `processing` state, run the AI steps synchronously,
then persist `completed` or `failed`. Text skips transcription; audio adds an S3 upload
and a Whisper pass first.

```mermaid
sequenceDiagram
    autonumber
    participant UI as Browser (React Query)
    participant API as NotesController
    participant S as NotesService
    participant S3 as S3 (audio)
    participant AI as AiProcessor (OpenAI)
    participant DB as PostgreSQL
    %% Audio uploads go straight to S3 via a presigned PUT — the file
    %% bytes never stream through the API.

    rect rgb(238,244,238)
    note over UI,DB: Text note — POST /api/notes/text
    UI->>API: createTextNote({ patientId, title, text, summarize })
    API->>S: createFromText(dto)
    S->>DB: findOne(patient)  %% 404 if unknown
    S->>DB: save(note, status=Processing, rawText=text)
    S->>AI: summarize(rawText)
    AI-->>S: SOAP text
    S->>DB: save(processedText, status=Completed)
    S-->>API: NoteDetailDto
    API-->>UI: 201 note
    UI->>UI: putDetail(cache) + invalidate list
    end

    rect rgb(244,240,236)
    note over UI,DB: Audio note — presigned direct-to-S3 upload
    UI->>API: createAudioUploadUrl({ filename, contentType })
    API->>S: createAudioUploadUrl(dto)
    S->>S3: presign PUT → { key, url }
    S-->>API: { key, url }
    API-->>UI: 201 { key, url }
    UI->>S3: PUT file (direct, presigned URL)
    S3-->>UI: 200
    UI->>API: createAudioNote({ patientId, audioKey, audioFilename, summarize })
    API->>S: createFromAudio(dto)
    S->>DB: findOne(patient)
    S->>DB: save(note, status=Processing, audioKey)
    S->>S3: downloadAudio(key) → buffer
    S->>AI: transcribe(buffer, filename)
    AI-->>S: transcription
    S->>DB: save(rawText=transcription)
    S->>AI: summarize(rawText)
    AI-->>S: SOAP text
    S->>DB: save(processedText, status=Completed)
    S-->>API: NoteDetailDto
    API-->>UI: 201 note
    end

    rect rgb(238,244,238)
    note over UI,S3: Playback — on demand, no credential in the note payload
    UI->>API: GET /api/notes/:id/audio  (<audio> src)
    API->>S: getAudioUrl(id) → sign S3 GET URL
    API-->>UI: 302 Location: signed S3 URL
    UI->>S3: GET audio (direct, signed)
    end

    note over S,DB: On any AI/S3 error → status=Failed, error=message (note is still persisted)
```

---

## 4. Database schema (ER)

Two tables. A patient has many notes; a note belongs to exactly one patient
(`patientId` FK, indexed, `ON DELETE CASCADE`). Schema is managed by TypeORM
(`DATABASE_SYNCHRONIZE=true` in this demo — no migration files).

```mermaid
erDiagram
    PATIENTS ||--o{ NOTES : "has"

    PATIENTS {
        uuid   id PK "gen_random_uuid()"
        string mrn UK "medical record number"
        string firstName
        string lastName
        date   dateOfBirth
        enum   sex "male | female | other | unknown (default unknown)"
        text   address "nullable"
        text   primaryConditions "nullable"
        timestamptz createdAt
        timestamptz updatedAt
    }

    NOTES {
        uuid   id PK "gen_random_uuid()"
        uuid   patientId FK "indexed, ON DELETE CASCADE"
        enum   source "text | audio"
        enum   status "pending | processing | completed | failed (default pending)"
        text   title "nullable — clinician title"
        text   rawText "nullable — typed text or transcription"
        text   processedText "nullable — AI SOAP output"
        text   audioKey "nullable — S3 object key"
        text   audioFilename "nullable — original upload name"
        text   error "nullable — failure detail"
        timestamptz createdAt
        timestamptz updatedAt
    }
```

**Enum reference**

| Table    | Column   | Values                                          |
|----------|----------|-------------------------------------------------|
| patients | `sex`    | `male`, `female`, `other`, `unknown` (default)  |
| notes    | `source` | `text`, `audio`                                 |
| notes    | `status` | `pending`, `processing`, `completed`, `failed`  |

---

## 5. Note lifecycle (state)

```mermaid
stateDiagram-v2
    [*] --> Pending: note created
    Pending --> Processing: begin AI steps
    Processing --> Completed: transcription (if audio) + SOAP succeed
    Processing --> Failed: S3 / Whisper / GPT error
    Completed --> [*]
    Failed --> [*]
```

> In the current implementation the note is written directly as `Processing` on create
> (the `Pending` default exists on the entity for an async-queue variant). Processing runs
> inline within the request; a production build would move it to a background worker.
