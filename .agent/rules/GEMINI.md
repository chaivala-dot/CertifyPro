# CertifyPro — Global Agent Rules (GEMINI.md)

> These rules are **automatically applied** to all AI agent interactions in this project.
> Do NOT override these. They define the non-negotiable standards for the CertifyPro codebase.

---

## 🧠 Core Mindset

> **THINK, don't copy. ASK, don't assume. BUILD for production from day one.**

- Always identify the task domain before writing code
- Ask the user for clarification when the request is ambiguous
- Never default to the same solution every time — context drives decisions
- Prefer explicit over implicit, simple over clever

---

## 🚫 Global Anti-Patterns (NEVER DO THESE)

| ❌ Anti-Pattern | ✅ Instead |
|---|---|
| Put business logic in a route/controller | Move to service layer |
| Call Prisma directly from a controller | Use service → repository pattern |
| Hardcode secrets, URLs, ports | Use `config/env.js` with env vars |
| Skip input validation | Always use Zod schema at API boundary |
| Run heavy work (PDF, email) in API request | Enqueue to Bull queue, return job ID |
| Store public S3 URLs in the DB | Store S3 key, generate signed URL on demand |
| Ignore errors silently | Log with Winston, propagate via next(err) |
| Write untested service functions | Min 1 unit test per service function |

---

## 📁 Folder Discipline

Every file must live in its correct layer. Cross-layer imports are forbidden:

```
routes/      → HTTP only. No business logic.
controllers/ → Input validation + delegate to service.
services/    → Business logic only. No Express, no HTTP.
workers/     → Bull job handlers only.
jobs/        → Queue enqueue helpers only.
pdf/         → Certificate rendering only.
email/       → Email templates + sending only.
storage/     → S3 upload/download/signed URL only.
middleware/  → Auth, rate limit, error handler only.
utils/       → Shared helpers. No business logic.
config/      → Env, constants, DB clients only.
```

---

## 🔐 Security Rules (Always Apply)

- All non-public routes MUST have `requireAuth` middleware
- JWT tokens must be verified on every request — no exceptions
- Validate ALL inputs with Zod — trust nothing from clients
- Rate limit all public endpoints
- Never log sensitive data (passwords, tokens, PII)
- S3 files must always use signed URLs (never public ACL)

---

## 📊 Response Format Standard

All API responses must follow this shape:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "Human-readable message", "code": "MACHINE_CODE" }

// Paginated list
{ "success": true, "data": [...], "meta": { "total": 100, "page": 1, "limit": 20 } }
```

---

## 🧪 Testing Requirements

- Unit tests: Every service function → `/tests/unit/`
- Integration tests: Every API endpoint → `/tests/integration/`
- Test file naming: `*.test.js` adjacent to source OR in `/tests/`
- Run tests before any PR: `npm test`
- Mock external services (S3, email, Puppeteer) in unit tests

---

## 📝 Code Style

- Language: JavaScript (Node.js 20 LTS) — no TypeScript unless agreed
- Async: Always `async/await` — never raw `.then()/.catch()` chains
- Imports: CommonJS `require()` — consistent with Express ecosystem
- Logging: Always use `logger` (Winston) — never `console.log` in production
- Comments: JSDoc on all exported service functions

---

## 🔄 Git Commit Convention

```
feat(scope): short description
fix(scope): short description
refactor(scope): short description

Examples:
feat(batch): add bulk certificate generation endpoint
fix(pdf): handle missing logo gracefully
refactor(auth): extract token validation to utility
```
