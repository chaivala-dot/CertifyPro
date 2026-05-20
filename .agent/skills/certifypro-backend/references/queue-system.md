# Queue System Reference

## When to Use a Queue
> Rule: If it takes more than 500ms OR could fail and retry → it goes in the queue.

| Task | Synchronous? | Queue? |
|---|---|---|
| Create batch record in DB | ✅ Yes | No |
| Generate 1 PDF | ❌ Never | ✅ Yes |
| Generate 100 PDFs | ❌ Never | ✅ Yes |
| Send email | ❌ Never | ✅ Yes |
| Create ZIP | ❌ Never | ✅ Yes |
| Return batch ID | ✅ Yes | No |

## Queue Setup

```javascript
// src/config/queues.js
const Queue = require('bull');
const { REDIS_URL } = require('./env');

const opts = { redis: REDIS_URL, defaultJobOptions: {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: 100,
  removeOnFail: 200,
}};

const batchQueue = new Queue('cert-batch', opts);
const emailQueue = new Queue('cert-email', opts);

module.exports = { batchQueue, emailQueue };
```

## Job Enqueue Helper

```javascript
// src/jobs/batch.job.js
const { batchQueue } = require('../config/queues');

exports.enqueueBatch = async (batchId) => {
  return batchQueue.add({ batchId }, {
    jobId: `batch-${batchId}`, // Prevents duplicate jobs
  });
};
```

## Worker Processor

```javascript
// src/workers/batch.worker.js
const { batchQueue } = require('../config/queues');
const { processBatch } = require('../services/pdf.service');
const { createZip } = require('../services/zip.service');
const { enqueueEmails } = require('../jobs/email.job');
const prisma = require('../config/prisma');
const logger = require('../utils/logger');

batchQueue.process(3, async (job) => { // concurrency: 3
  const { batchId } = job.data;
  logger.info(`[Worker] Batch ${batchId} starting`);

  await prisma.batch.update({ where: { id: batchId }, data: { status: 'PROCESSING' } });

  // Render all PDFs with progress reporting
  await processBatch(batchId, (done, total) => {
    job.progress(Math.floor((done / total) * 100));
  });

  // Bundle into ZIP
  const zipUrl = await createZip(batchId);

  await prisma.batch.update({ where: { id: batchId }, data: { status: 'DONE', zipUrl } });

  // Queue emails
  await enqueueEmails(batchId);
  logger.info(`[Worker] Batch ${batchId} complete`);
});

batchQueue.on('failed', async (job, err) => {
  logger.error(`[Worker] Batch ${job.data.batchId} failed: ${err.message}`);
  await prisma.batch.update({
    where: { id: job.data.batchId },
    data: { status: 'FAILED' },
  });
});
```

## Progress Streaming (SSE)

```javascript
// src/services/batch.service.js — streamProgress
exports.streamProgress = async (batchId, userId, send) => {
  const batch = await prisma.batch.findFirst({ where: { id: batchId, userId } });
  if (!batch) throw new AppError('Not found', 404, 'BATCH_NOT_FOUND');

  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const current = await prisma.batch.findUnique({ where: { id: batchId } });
      send({ status: current.status, done: current.doneCount, total: current.totalCount, zipUrl: current.zipUrl });
      if (['DONE', 'FAILED'].includes(current.status)) { clearInterval(interval); resolve(); }
    }, 1000);
    setTimeout(() => { clearInterval(interval); resolve(); }, 600_000); // 10min max
  });
};
```
