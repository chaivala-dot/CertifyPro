# API Patterns Reference

## Standard Response Shape

```javascript
// Always use this shape — no exceptions
{ "success": true, "data": { ... } }           // single resource
{ "success": true, "data": [...], "meta": {} } // list
{ "success": false, "error": "...", "code": "SCREAMING_SNAKE" } // error
```

## Zod Schema Patterns

```javascript
// Reusable schemas — put in utils/schemas.js
const recipientSchema = z.object({
  name:   z.string().min(1).max(200),
  course: z.string().min(1).max(500),
  email:  z.string().email().optional(),
  date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const paginationSchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
```

## SSE (Server-Sent Events) for Progress

```javascript
// Controller — SSE streaming endpoint
exports.progress = async (req, res, next) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
    await batchService.streamProgress(req.params.id, req.user.id, send);
    res.end();
  } catch (err) { next(err); }
};
```

## Pagination Pattern

```javascript
// Service
exports.listBatches = async (userId, { page, limit }) => {
  const skip = (page - 1) * limit;
  const [batches, total] = await Promise.all([
    prisma.batch.findMany({ where: { userId }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.batch.count({ where: { userId } }),
  ]);
  return { data: batches, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
};
```

## Custom AppError Class

```javascript
// src/utils/errors.js
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}

// Usage
throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND');
throw new AppError('Batch limit exceeded', 429, 'RATE_LIMIT');
```

## Auth Middleware

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { AppError } = require('../utils/errors');

exports.requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new AppError('No token provided', 401, 'UNAUTHORIZED');

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401, 'UNAUTHORIZED'));
    }
    next(err);
  }
};
```

## HTTP Status Code Reference

| Status | When |
|---|---|
| 200 | GET success, PUT success |
| 201 | POST success (created) |
| 204 | DELETE success (no body) |
| 400 | Bad input (Zod fails) |
| 401 | No or invalid auth token |
| 403 | Valid auth, no permission |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |
