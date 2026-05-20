# CertifyPro

## Current State
New project — no existing code.

## Requested Changes (Diff)

### Add
- **Certificate Template Builder**: Canvas-based drag-and-drop editor with configurable text fields (recipient name, course title, date, custom fields), background image upload, logo placement, and template save/load
- **Bulk Generation via CSV Upload**: Parse CSV/Excel data, map columns to template fields, generate multiple certificates with preview, download all as ZIP
- **QR Code Verification System**: Each certificate gets a unique ID and QR code; public verification page shows certificate validity and recipient details
- **Certificate Management Dashboard**: View all generated certificate batches, recipient list per batch, download individual or bulk certificates, analytics (total generated, batch history)
- **Template Library**: Save and reuse certificate templates, with sample pre-built templates
- **Public Certificate Page**: Shareable URL per certificate showing the certificate with verification status
- **User Authentication**: Login/signup to manage templates and certificate batches

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan

### Backend (Motoko)
1. User management: store user profiles
2. Template data model: id, name, fields (JSON with positions/styles), background URL, createdAt
3. Certificate batch data model: id, templateId, name, recipients (array of {name, email, fields, certId, qrCode}), createdAt, status
4. Individual certificate data model: id, batchId, recipientName, recipientEmail, customFields, uniqueCode, issuedAt
5. APIs: createTemplate, getTemplates, getTemplate, updateTemplate, deleteTemplate
6. APIs: createBatch, getBatches, getBatch, getCertificate, verifyCertificate (public, by uniqueCode)
7. Analytics: total certificates issued, certificates per batch

### Frontend
1. Landing page with product overview and CTA
2. Auth pages (login/signup)
3. Dashboard: batch history, stats cards, quick actions
4. Template builder: canvas editor with draggable text/image fields, save template
5. Template library page: list saved templates, select for new batch
6. Bulk generation flow: upload CSV, map columns to template fields, preview, generate
7. Batch detail page: list recipients, download individual certs, download all ZIP
8. Public verify page (`/verify/:uniqueCode`): show certificate validity, recipient info, issue date
9. Public certificate page (`/cert/:uniqueCode`): display certificate visually with share buttons
