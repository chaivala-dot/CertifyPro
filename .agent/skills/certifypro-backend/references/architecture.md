# CertifyPro — System Architecture

## Layer Map

```
HTTP Request
    │
    ▼
┌─────────────────────────────────────────┐
│           ROUTES (routes/)              │
│  Define paths + attach middleware only  │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│        CONTROLLERS (controllers/)       │
│  Validate input (Zod) → call service   │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│          SERVICES (services/)           │
│  All business logic. No Express here.  │
└───────┬─────────────────────┬───────────┘
        │                     │
        ▼                     ▼
┌──────────────┐   ┌──────────────────────┐
│  PRISMA ORM  │   │   EXTERNAL SERVICES  │
│  (database)  │   │  S3 / Queue / Email  │
└──────────────┘   └──────────────────────┘

ASYNC WORK (separate process):
┌─────────────────────────────────────────┐
│       JOBS (jobs/) → WORKERS (workers/) │
│  Bull queue enqueue → Bull job handler  │
│  → PDF engine → S3 upload → Email send  │
└─────────────────────────────────────────┘
```

## Folder Structure

```
/backend
  /src
    /routes          ← Express routers. No logic.
    /controllers     ← Zod validation + call service.
    /services        ← Business logic. Framework-agnostic.
    /workers         ← Bull job processors.
    /jobs            ← Queue enqueue helpers.
    /pdf             ← Puppeteer certificate renderer.
    /email           ← Nodemailer templates + sender.
    /storage         ← AWS S3 wrapper.
    /middleware      ← auth, errorHandler, rateLimiter.
    /prisma          ← schema.prisma + migrations.
    /utils           ← logger, errors, validators.
    /config          ← env.js, prisma client, queue clients.
  /tests
    /unit            ← Unit tests (mock DB/S3/queue)
    /integration     ← Supertest API integration tests
  app.js             ← Express app (no routes in this file)
  server.js          ← HTTP server start
  worker.js          ← Bull worker process entry point
```

## Import Rules (Cross-layer imports FORBIDDEN)

```
✅ ALLOWED:
route     → controller
controller → service
service   → prisma, storage, jobs
worker    → service, pdf, email, storage
middleware → utils, config

❌ FORBIDDEN:
route     → service (skip controller)
controller → prisma (skip service)
service   → controller
service   → express/req/res
worker    → controller
pdf       → service (pdf is a pure renderer)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | Express 4.x |
| ORM | Prisma 5.x + PostgreSQL 15 |
| Queue | Bull 4.x + Redis 7 |
| PDF | Puppeteer 21.x + Handlebars |
| Storage | AWS SDK v3 (S3) |
| Email | Nodemailer 6.x |
| QR | qrcode 1.5.x |
| Validation | Zod 3.x |
| Auth | jsonwebtoken 9.x |
| Logging | Winston 3.x |
| Testing | Jest 29.x + Supertest |
