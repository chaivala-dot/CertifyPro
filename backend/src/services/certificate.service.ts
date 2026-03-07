import { prisma } from "../db.js";

interface CustomFields {
    downloadCount?: number;
    [key: string]: unknown;
}

function isValidCustomFields(value: unknown): value is CustomFields {
    return typeof value === "object" && value !== null;
}

export class CertificateService {
    async getCertificate(id: string) {
        return await prisma.certificate.findUnique({
            where: { id },
            include: {
                batch: {
                    include: {
                        template: true,
                    },
                },
            },
        });
    }

    async verifyCertificate(code: string) {
        return await prisma.certificate.findUnique({
            where: { uniqueCode: code },
            include: {
                batch: {
                    include: {
                        template: true,
                    },
                },
            },
        });
    }

    async incrementDownloadCount(id: string) {
        const cert = await prisma.certificate.findUnique({ where: { id } });
        if (!cert) {
            const error = new Error("Certificate not found");
            (error as any).statusCode = 404;
            throw error;
        }

        const existingFields = isValidCustomFields(cert.customFields)
            ? (cert.customFields as Record<string, unknown>)
            : {};

        const currentDownloadCount = typeof existingFields.downloadCount === "number"
            ? existingFields.downloadCount
            : 0;

        return await prisma.certificate.update({
            where: { id },
            data: {
                customFields: {
                    ...existingFields,
                    downloadCount: currentDownloadCount + 1,
                },
            },
        });
    }
}

export const certificateService = new CertificateService();
