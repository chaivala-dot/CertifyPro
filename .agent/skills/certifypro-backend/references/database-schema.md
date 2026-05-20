# Database Schema Reference

## Full Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   // bcrypt hashed
  orgId     String?
  org       Organization? @relation(fields: [orgId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  batches   Batch[]
  templates Template[]
}

model Organization {
  id      String  @id @default(cuid())
  name    String
  logoUrl String?
  users   User[]
  batches Batch[]
}

model Template {
  id        String   @id @default(cuid())
  name      String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  config    Json     // { bgColor, accentColor, textColor, nameFont, bodyFont, issuerName, bodyText, logoUrl, signatureUrl }
  previewUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  batches   Batch[]
}

model Batch {
  id           String       @id @default(cuid())
  userId       String
  user         User         @relation(fields: [userId], references: [id])
  orgId        String?
  org          Organization? @relation(fields: [orgId], references: [id])
  templateId   String?
  template     Template?    @relation(fields: [templateId], references: [id])
  status       BatchStatus  @default(PENDING)
  totalCount   Int
  doneCount    Int          @default(0)
  zipUrl       String?      // S3 key (not URL)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  certificates Certificate[]
}

model Certificate {
  id            String   @id @default(cuid())
  batchId       String
  batch         Batch    @relation(fields: [batchId], references: [id], onDelete: Cascade)
  recipientName String
  course        String
  email         String?
  issueDate     DateTime
  pdfUrl        String?  // S3 key (not URL)
  verifyCode    String   @unique @default(cuid())
  emailSent     Boolean  @default(false)
  createdAt     DateTime @default(now())
}

enum BatchStatus {
  PENDING
  PROCESSING
  DONE
  FAILED
}
```

## Migration Commands

```bash
# Create a new migration
npx prisma migrate dev --name describe_the_change

# Apply in production
npx prisma migrate deploy

# Regenerate client after schema change
npx prisma generate

# Reset dev DB (WARNING: destroys data)
npx prisma migrate reset
```

## Query Patterns

```javascript
// Always include only what you need — no SELECT *
const batch = await prisma.batch.findUnique({
  where: { id: batchId },
  select: { id: true, status: true, totalCount: true, doneCount: true },
});

// Ownership check — always verify userId on sensitive queries
const batch = await prisma.batch.findFirst({
  where: { id: batchId, userId: req.user.id }, // Prevents data leakage
});
if (!batch) throw new AppError('Not found', 404, 'BATCH_NOT_FOUND');

// Bulk create with connect
await prisma.batch.create({
  data: {
    userId,
    certificates: { create: recipients.map(r => ({ ... })) },
  },
});
```
