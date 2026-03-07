import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/db.js", () => {
    return {
        prisma: {
            batch: {
                findMany: vi.fn(),
                findUnique: vi.fn(),
                create: vi.fn(),
                delete: vi.fn(),
            },
            template: {
                findUnique: vi.fn(),
            }
        },
    };
});

import { prisma } from "../../src/db.js";
import { batchService } from "../../src/services/batch.service.js";

describe("BatchService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("createBatch", () => {
        it("should throw a 404 error if template does not exist", async () => {
            vi.mocked(prisma.template.findUnique).mockResolvedValue(null);

            await expect(
                batchService.createBatch("user-1", { name: "Batch 1", templateId: "no-exist" })
            ).rejects.toThrow("Template not found");
        });

        it("should create a batch and associated certificates", async () => {
            const mockTemplate = { id: "template-1", name: "T1" };
            vi.mocked(prisma.template.findUnique).mockResolvedValue(mockTemplate as any);

            const mockBatch = { id: "batch-1", name: "Batch 1", templateId: "template-1" };
            vi.mocked(prisma.batch.create).mockResolvedValue(mockBatch as any);

            const result = await batchService.createBatch("user-1", {
                name: "Batch 1",
                templateId: "template-1",
                recipients: [{ name: "Alice", email: "alice@example.com" }]
            });

            expect(result).toEqual(mockBatch);
            expect(prisma.batch.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: "Batch 1",
                    totalCount: 1,
                }),
                include: { certificates: true }
            });
        });
    });
});
