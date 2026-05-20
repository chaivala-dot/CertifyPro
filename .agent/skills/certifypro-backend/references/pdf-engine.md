# PDF Engine Reference

## How It Works

```
Certificate data + Template config
         │
         ▼
  Handlebars fills HTML template
         │
         ▼
  Puppeteer renders HTML → PDF buffer
         │
         ▼
  Buffer uploaded to S3
         │
         ▼
  S3 key saved to Certificate record in DB
```

## Rendering Function

```javascript
// src/pdf/certificate.renderer.js
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { uploadToS3 } = require('../storage/s3.service');

const htmlTemplate = fs.readFileSync(path.join(__dirname, 'certificate.hbs'), 'utf8');
const compile = Handlebars.compile(htmlTemplate);

exports.renderCertificate = async (cert, templateConfig) => {
  const verifyUrl = `${process.env.APP_URL}/verify/${cert.verifyCode}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 80, margin: 1 });

  const html = compile({
    recipientName: cert.recipientName,
    courseTitle:   cert.course,
    issueDate:     cert.issueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    issuerName:    templateConfig.issuerName || 'CertifyPro Academy',
    bodyText:      templateConfig.bodyText || 'Awarded in recognition of outstanding achievement.',
    bgColor:       templateConfig.bgColor || '#fffdf0',
    accentColor:   templateConfig.accentColor || '#c9963a',
    textColor:     templateConfig.textColor || '#1a1509',
    logoUrl:       templateConfig.logoUrl || null,
    signatureUrl:  templateConfig.signatureUrl || null,
    qrDataUrl,
  });

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 707 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    width: '1000px', height: '707px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();

  const s3Key = `certificates/${cert.batchId}/${cert.id}.pdf`;
  await uploadToS3(s3Key, pdf, 'application/pdf');
  return s3Key; // Return KEY, not URL
};
```

## Bulk Processing (chunked to avoid OOM)

```javascript
// src/services/pdf.service.js
const prisma = require('../config/prisma');
const { renderCertificate } = require('../pdf/certificate.renderer');
const logger = require('../utils/logger');
const CHUNK = 5; // Never process more than 5 PDFs concurrently

exports.processBatch = async (batchId, onProgress) => {
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { certificates: true, template: true },
  });

  const total = batch.certificates.length;
  let done = 0;

  for (let i = 0; i < batch.certificates.length; i += CHUNK) {
    const chunk = batch.certificates.slice(i, i + CHUNK);
    await Promise.all(chunk.map(async (cert) => {
      try {
        const s3Key = await renderCertificate(cert, batch.template?.config || {});
        await prisma.certificate.update({ where: { id: cert.id }, data: { pdfUrl: s3Key } });
        done++;
        await prisma.batch.update({ where: { id: batchId }, data: { doneCount: done } });
        onProgress(done, total);
      } catch (err) {
        logger.error(`Failed cert ${cert.id}: ${err.message}`);
        // Continue processing others — don't fail the whole batch for one cert
      }
    }));
  }
};
```

## Template Variables Available in .hbs

| Variable | Type | Source |
|---|---|---|
| `recipientName` | string | cert.recipientName |
| `courseTitle` | string | cert.course |
| `issueDate` | string | Formatted from cert.issueDate |
| `issuerName` | string | template.config.issuerName |
| `bodyText` | string | template.config.bodyText |
| `bgColor` | hex | template.config.bgColor |
| `accentColor` | hex | template.config.accentColor |
| `textColor` | hex | template.config.textColor |
| `logoUrl` | string/null | template.config.logoUrl (S3 signed URL) |
| `signatureUrl` | string/null | template.config.signatureUrl (S3 signed URL) |
| `qrDataUrl` | base64 | Generated from cert.verifyCode |
