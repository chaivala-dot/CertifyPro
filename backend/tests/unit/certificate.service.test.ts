import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/db.js", () => {
    return {
        prisma: {
            certificate: {
                findUnique: vi.fn(),
                update: vi.fn(),
            },
        },
    };
});

import { prisma } from "../../src/db.js";
import { certificateService } from "../../src/services/certificate.service.js";

describe("CertificateService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getCertificate", () => {
        it("should return a certificate by ID", async () => {
            const mockCert = { id: "cert-1", recipientName: "Bob" };
            vi.mocked(prisma.certificate.findUnique).mockResolvedValue(mockCert as any);

            const result = await certificateService.getCertificate("cert-1");
            expect(result).toEqual(mockCert);
            expect(prisma.certificate.findUnique).toHaveBeenCalledWith({
                where: { id: "cert-1" },
                include: expect.anything()
            });
        });
    });

    describe("incrementDownloadCount", () => {
        it("should throw 404 if certificate not found", async () => {
            vi.mocked(prisma.certificate.findUnique).mockResolvedValue(null);

            await expect(
                certificateService.incrementDownloadCount("no-exist")
            ).rejects.toThrow("Certificate not found");
        });

        it("should increment an existing download count safely", async () => {
            const mockCert = {
                id: "cert-1",
                customFields: { downloadCount: 2 }
            };

            const mockUpdated = { ...mockCert, customFields: { downloadCount: 3 } };

            vi.mocked(prisma.certificate.findUnique).mockResolvedValue(mockCert as any);
            vi.mocked(prisma.certificate.update).mockResolvedValue(mockUpdated as any);

            const result = await certificateService.incrementDownloadCount("cert-1");
            expect(result.customFields.downloadCount).toBe(3);
        });
    });
});
