import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";

export class TemplateService {
    async listTemplates() {
        return await prisma.template.findMany({
            orderBy: { createdAt: "desc" },
        });
    }

    async getTemplate(id: string) {
        return await prisma.template.findUnique({
            where: { id },
        });
    }

    async createTemplate(creatorId: string, data: { name: string; backgroundUrl?: string | null; canvasStateJson?: unknown }) {
        const canvas =
            typeof data.canvasStateJson === "string"
                ? data.canvasStateJson
                : JSON.stringify(data.canvasStateJson ?? {});

        return await prisma.template.create({
            data: {
                name: data.name,
                backgroundUrl: typeof data.backgroundUrl === "string" ? data.backgroundUrl : null,
                canvasStateJson: canvas,
                creatorId,
            },
        });
    }

    async updateTemplate(id: string, creatorId: string, data: { name: string; backgroundUrl?: string | null; canvasStateJson?: unknown }) {
        const existing = await this.getTemplate(id);
        if (!existing) {
            const error = new Error("Template not found");
            (error as any).statusCode = 404;
            throw error;
        }

        if (existing.creatorId !== creatorId) {
            const error = new Error("Forbidden");
            (error as any).statusCode = 403;
            throw error;
        }

        const canvas =
            typeof data.canvasStateJson === "string"
                ? data.canvasStateJson
                : JSON.stringify(data.canvasStateJson ?? {});

        return await prisma.template.update({
            where: { id },
            data: {
                name: data.name,
                backgroundUrl: typeof data.backgroundUrl === "string" ? data.backgroundUrl : null,
                canvasStateJson: canvas,
            },
        });
    }

    async deleteTemplate(id: string, creatorId: string) {
        const existing = await this.getTemplate(id);
        if (!existing) {
            const error = new Error("Template not found");
            (error as any).statusCode = 404;
            throw error;
        }

        if (existing.creatorId !== creatorId) {
            const error = new Error("Forbidden");
            (error as any).statusCode = 403;
            throw error;
        }

        await prisma.template.delete({ where: { id } });
    }
}

export const templateService = new TemplateService();
