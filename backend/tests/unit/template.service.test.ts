import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the prisma client completely
vi.mock("../../src/db.js", () => {
    return {
        prisma: {
            template: {
                findMany: vi.fn(),
                findUnique: vi.fn(),
                create: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
            },
        },
    };
});

import { prisma } from "../../src/db.js";
import { templateService } from "../../src/services/template.service.js";

describe("TemplateService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("listTemplates", () => {
        it("should return a list of templates", async () => {
            const mockTemplates = [{ id: "1", name: "Test Template" }];
            vi.mocked(prisma.template.findMany).mockResolvedValue(mockTemplates as any);

            const result = await templateService.listTemplates();
            expect(result).toEqual(mockTemplates);
            expect(prisma.template.findMany).toHaveBeenCalled();
        });
    });

    describe("createTemplate", () => {
        it("should create a template with valid data", async () => {
            const mockData = { name: "New Template", backgroundUrl: "http://example.com/bg.png" };
            const creatorId = "user-123";

            const mockCreated = { id: "1", ...mockData, creatorId };
            vi.mocked(prisma.template.create).mockResolvedValue(mockCreated as any);

            const result = await templateService.createTemplate(creatorId, mockData);

            expect(result).toEqual(mockCreated);
            expect(prisma.template.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: "New Template",
                    backgroundUrl: "http://example.com/bg.png",
                    creatorId: "user-123"
                })
            });
        });
    });
});
