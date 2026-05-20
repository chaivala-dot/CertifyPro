---
name: certifypro-backend
description: >
  CertifyPro backend development — architecture, API patterns, PDF generation, bulk
  certificate queues, S3 storage, email distribution, QR verification, and database
  schema. Use this skill for ANY backend task: adding endpoints, writing services,
  building workers, designing schema, or fixing bugs. Load this skill before writing
  any backend code — it contains decision trees, code patterns, and a completion
  checklist that ensures accurate, production-grade output every time. Do not skip
  reading this skill for backend tasks, even simple ones.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# CertifyPro Backend Skill

> **Philosophy:** THINK before coding. Identify the layer. Follow the pattern. Validate the output.
> **Core Principle:** Every layer has one job. Never cross boundaries.

---

## 🎯 Selective Reading Rule (MANDATORY)

**Read REQUIRED files always. Read OPTIONAL files only when the task needs them.**

| File | Status | When to Read |
|------|--------|--------------|
| This SKILL.md | 🔴 **REQUIRED** | Always — read fully before any code |
| [architecture.md](references/architecture.md) | 🔴 **REQUIRED** | Always — system map and folder rules |
| [api-patterns.md](references/api-patterns.md) | ⚪ Optional | Writing routes, controllers, or services |
| [pdf-engine.md](references/pdf-engine.md) | ⚪ Optional | Certificate rendering or Puppeteer |
| [queue-system.md](references/queue-system.md) | ⚪ Optional | Bulk jobs, Bull queues, or workers |
| [email-system.md](references/email-system.md) | ⚪ Optional | Email sending or templates |
| [storage-system.md](references/storage-system.md) | ⚪ Optional | S3 upload, download, or signed URLs |
| [database-schema.md](references/database-schema.md) | ⚪ Optional | Prisma schema or migrations |

---

## ⚠️ CRITICAL: ASK BEFORE ASSUMING

> **STOP. If the request is vague, ask first — don't default to a guess.**

**Endpoint not specified?** Ask:
> "Which HTTP method and path? (e.g. POST /api/batches or GET /api/certificates/:id)"

**Framework unclear?** Ask:
> "Are you using Express (current default) or NestJS for this project?"

**Queue needed?** Ask:
> "Should this run synchronously in the request or as a background job?"

**Storage unclear?** Ask:
> "Should this be stored in S3, local filesystem, or the database?"

---

## ⛔ Backend Anti-Patterns (NEVER DO THESE)

| ❌ Never | ✅ Always |
|---|---|
| Business logic in routes | Routes call controllers only |
| Prisma calls in controllers | Controllers call services |
| `console.log()` in production | `logger.info()` / `logger.error()` |
| Hardcoded secrets or ports | `config/env.js` with `.env` |
| Synchronous Puppeteer in API request | Enqueue to Bull queue |
| Public S3 URLs stored in DB | Store S3 key, sign on demand |
| Unauthenticated routes (except `/verify`, `/health`) | `requireAuth` middleware on all routes |
| Skipping Zod validation on POST/PUT | Schema validation in every controller |
| Fire-and-forget without error handling | Catch, log, and propagate all errors |

---

## 1. Layer Decision Tree

Before writing any code, identify which layer this task belongs to:

```
WHAT IS THE TASK?
│
├─ Defining HTTP path + method?
│   └── → Route file only (no logic)
│
├─ Reading request body, validating input?
│   └── → Controller (Zod schema + call service)
│
├─ Business logic, data transformation?
│   └── → Service (no Express, no HTTP imports)
│
├─ Long-running operation (PDF, email blast)?
│   └── → Job (enqueue) + Worker (process)
│
├─ Rendering a certificate to PDF?
│   └── → pdf/ directory. Read pdf-engine.md first.
│
├─ Sending email?
│   └── → email/ directory. Read email-system.md first.
│
├─ Uploading/downloading files?
│   └── → storage/s3.service.js. Read storage-system.md first.
│
├─ Changing database structure?
│   └── → prisma/schema.prisma. Read database-schema.md first.
│
└─ Auth, rate limiting, error handling?
    └── → middleware/ directory only.
```

---

## 2. Code Patterns

### Pattern: Route File
```javascript
// src/routes/batch.routes.js
// RULE: No logic. Only routing + middleware.
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const batchController = require('../controllers/batch.controller');

router.post('/',          requireAuth, batchController.create);
router.get('/',           requireAuth, batchController.list);
router.get('/:id',        requireAuth, batchController.getOne);
router.get('/:id/progress', requireAuth, batchController.progress); // SSE
router.get('/:id/download', requireAuth, batchController.download);

module.exports = router;
```

### Pattern: Controller
```javascript
// src/controllers/batch.controller.js
// RULE: Validate input with Zod. Delegate to service. Handle errors.
const { z } = require('zod');
const batchService = require('../services/batch.service');

const createSchema = z.object({
  templateId: z.string().cuid().optional(),
  recipients: z.array(z.object({
    name:   z.string().min(1),
    course: z.string().min(1),
    email:  z.string().email().optional(),
    date:   z.string().optional(),
  })).min(1).max(5000),
});

exports.create = async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const batch = await batchService.createBatch(req.user.id, data);
    res.status(201).json({ success: true, data: batch });
  } catch (err) {
    next(err); // Always next(err), never res.json in catch
  }
};
```

### Pattern: Service
```javascript
// src/services/batch.service.js
// RULE: Business logic only. No Express. No HTTP. Pure functions where possible.
const prisma = require('../config/prisma');
const { enqueueBatch } = require('../jobs/batch.job');
const logger = require('../utils/logger');

exports.createBatch = async (userId, { templateId, recipients }) => {
  const batch = await prisma.batch.create({
    data: {
      userId,
      templateId: templateId || null,
      totalCount: recipients.length,
      status: 'PENDING',
      certificates: {
        create: recipients.map(r => ({
          recipientName: r.name,
          course: r.course,
          email: r.email || null,
          issueDate: r.date ? new Date(r.date) : new Date(),
        }))
      }
    }
  });

  await enqueueBatch(batch.id);
  logger.info(`Batch created: ${batch.id} (${recipients.length} certs)`);
  return batch;
};
```

### Pattern: Error Handler Middleware
```javascript
// src/middleware/errorHandler.js
const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  // Zod validation error
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.errors,
    });
  }
  // App-level error
  const status = err.statusCode || 500;
  logger.error(err.message, { path: req.path, stack: err.stack });
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
};
```

---

## 3. Environment Variables Reference

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/certifypro

# Redis (Queue)
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=change-this-in-production

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET=certifypro-certs

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=...
FROM_EMAIL=noreply@certifypro.com

# App
APP_URL=https://certifypro.com
PORT=4000
NODE_ENV=production
```

---

## 4. API Routes Map

```
AUTH
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

TEMPLATES
  POST   /api/templates
  GET    /api/templates
  GET    /api/templates/:id
  PUT    /api/templates/:id
  DELETE /api/templates/:id

BATCHES (bulk generation)
  POST   /api/batches              ← triggers Bull queue
  GET    /api/batches
  GET    /api/batches/:id
  GET    /api/batches/:id/progress ← SSE stream
  GET    /api/batches/:id/download ← signed S3 ZIP URL

CERTIFICATES
  GET    /api/certificates/:verifyCode  ← PUBLIC, no auth
  POST   /api/certificates/:id/email   ← resend email

HEALTH
  GET    /api/health
```

---

## 5. Pre-Completion Checklist

> Run through this before every response. Do not skip.

- [ ] **Layer correct** — No controller has DB calls. No route has logic.
- [ ] **Zod schema** — Every POST/PUT has input validation.
- [ ] **Error handling** — All async functions try/catch + next(err).
- [ ] **Auth middleware** — Every non-public route has `requireAuth`.
- [ ] **Logger** — Used logger.info/error, not console.log.
- [ ] **No hardcoded values** — All secrets/URLs from config/env.js.
- [ ] **Async work queued** — PDF gen and email go through Bull.
- [ ] **S3 keys stored, not URLs** — Signed URLs generated on demand.
- [ ] **Tests noted** — At least one unit test per new service function.
- [ ] **Schema migrated** — If Prisma changed, migration exists.
