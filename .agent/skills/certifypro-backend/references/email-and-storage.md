# Storage System Reference

## Rule: Always Store S3 Keys, Never Full URLs

```javascript
// ✅ Store key
await prisma.certificate.update({ data: { pdfUrl: 'certificates/b1/c1.pdf' } });

// ❌ Never store full URL
await prisma.certificate.update({ data: { pdfUrl: 'https://s3.amazonaws.com/...' } });
```

## S3 Service

```javascript
// src/storage/s3.service.js
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET } = require('../config/env');

const s3 = new S3Client({ region: AWS_REGION, credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } });

// Upload buffer → returns S3 key
exports.uploadToS3 = async (key, buffer, contentType) => {
  await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: buffer, ContentType: contentType, ServerSideEncryption: 'AES256' }));
  return key;
};

// Get file as Buffer
exports.getFromS3 = async (key) => {
  const res = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
  const chunks = [];
  for await (const chunk of res.Body) chunks.push(chunk);
  return Buffer.concat(chunks);
};

// Generate temporary signed URL (default 1 hour)
exports.getPresignedUrl = async (key, expiresIn = 3600) => {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), { expiresIn });
};
```

## S3 Key Naming Convention

```
certificates/{batchId}/{certId}.pdf
zips/{batchId}/all-certificates.zip
templates/{userId}/logo-{timestamp}.png
templates/{userId}/signature-{timestamp}.png
```

---

# Email System Reference

## When to Send Email

- Never from a controller or route
- Always from `emailQueue` worker
- Only send after PDF is confirmed uploaded to S3

## Email Service

```javascript
// src/services/email.service.js
const transporter = require('../config/mailer');
const prisma = require('../config/prisma');
const { getPresignedUrl } = require('../storage/s3.service');
const { AppError } = require('../utils/errors');

exports.sendCertificateEmail = async (certId) => {
  const cert = await prisma.certificate.findUnique({
    where: { id: certId },
    include: { batch: true },
  });

  if (!cert?.email) throw new AppError('No email for certificate', 400, 'NO_EMAIL');
  if (!cert.pdfUrl)  throw new AppError('PDF not ready', 400, 'PDF_NOT_READY');

  const downloadUrl = await getPresignedUrl(cert.pdfUrl, 7 * 24 * 3600); // 7 days
  const verifyUrl   = `${process.env.APP_URL}/verify/${cert.verifyCode}`;

  await transporter.sendMail({
    from:    `"CertifyPro" <${process.env.FROM_EMAIL}>`,
    to:      cert.email,
    subject: `Your Certificate — ${cert.course}`,
    html:    buildEmailHTML({ cert, downloadUrl, verifyUrl }),
  });

  await prisma.certificate.update({ where: { id: certId }, data: { emailSent: true } });
};

function buildEmailHTML({ cert, downloadUrl, verifyUrl }) {
  return `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#f5f0e8;padding:40px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden">
      <div style="background:#1a2340;padding:24px;text-align:center">
        <h1 style="color:#c9963a;margin:0;font-size:20px">🎓 CertifyPro</h1>
      </div>
      <div style="padding:32px">
        <p>Dear <strong>${cert.recipientName}</strong>,</p>
        <p>Your certificate for <strong>${cert.course}</strong> is ready.</p>
        <p><a href="${downloadUrl}" style="background:#c9963a;color:#1a2340;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block">⬇ Download Certificate</a></p>
        <p style="font-size:12px;color:#9a8e78">Verify at: <a href="${verifyUrl}">${verifyUrl}</a></p>
      </div>
    </div>
  </body></html>`;
}
```
