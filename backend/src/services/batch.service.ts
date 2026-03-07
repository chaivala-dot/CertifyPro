import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";

export class BatchService {
    async listBatches() {
        return await prisma.batch.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                template: true,
                certificates: true,
            },
        });
    }

    async getBatch(id: string) {
        return await prisma.batch.findUnique({
            where: { id },
            include: {
                template: true,
                certificates: true,
            },
        });
    }

    async createBatch(creatorId: string, data: { name: string; templateId: string; recipients?: Array<{ name: string; email?: string; customFields?: unknown }> }) {
        const template = await prisma.template.findUnique({ where: { id: data.templateId } });
        if (!template) {
            const error = new Error("Template not found");
            (error as any).statusCode = 404;
            throw error;
        }

        const safeRecipients = Array.isArray(data.recipients) ? data.recipients : [];

        return await prisma.batch.create({
            data: {
                name: data.name,
                templateId: data.templateId,
                creatorId,
                totalCount: safeRecipients.length,
                certificates: {
                    create: safeRecipients.map((r) => ({
                        recipientName: r.name,
                        recipientEmail: r.email ?? null,
                        customFields: (r.customFields ?? {}) as unknown as Prisma.InputJsonValue,
                        issuedAt: new Date(),
                        status: "GENERATED",
                    })),
                },
            },
            include: {
                certificates: true,
            },
        });
    }

    async deleteBatch(id: string, creatorId: string) {
        const batch = await this.getBatch(id);
        if (!batch) {
            const error = new Error("Batch not found");
            (error as any).statusCode = 404;
            throw error;
        }

        if (batch.creatorId !== creatorId) {
            const error = new Error("Forbidden");
            (error as any).statusCode = 403;
            throw error;
        }

        await prisma.batch.delete({ where: { id } });
    }
}

export const batchService = new BatchService();
