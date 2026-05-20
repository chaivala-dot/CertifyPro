"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchesRouter = void 0;
const express_1 = __importDefault(require("express"));
const db_js_1 = require("../db.js");
const auth_js_1 = require("../middleware/auth.js");
const router = express_1.default.Router();
router.get("/", async (_req, res) => {
    const batches = await db_js_1.prisma.batch.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            template: true,
            certificates: true,
        },
    });
    res.json(batches);
});
router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const batch = await db_js_1.prisma.batch.findUnique({
        where: { id },
        include: {
            template: true,
            certificates: true,
        },
    });
    if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
    }
    res.json(batch);
});
router.post("/", auth_js_1.requireAuth, async (req, res) => {
    const authReq = req;
    const { name, templateId, recipients } = req.body;
    if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "name is required" });
    }
    if (!templateId || typeof templateId !== "string") {
        return res.status(400).json({ error: "templateId is required" });
    }
    const template = await db_js_1.prisma.template.findUnique({ where: { id: templateId } });
    if (!template) {
        return res.status(404).json({ error: "Template not found" });
    }
    const safeRecipients = Array.isArray(recipients) ? recipients : [];
    const batch = await db_js_1.prisma.batch.create({
        data: {
            name,
            templateId,
            creatorId: authReq.user.id,
            totalCount: safeRecipients.length,
            certificates: {
                create: safeRecipients.map((r) => ({
                    recipientName: r.name,
                    recipientEmail: r.email ?? null,
                    customFields: (r.customFields ?? {}),
                    issuedAt: new Date(),
                    status: "GENERATED",
                })),
            },
        },
        include: {
            certificates: true,
        },
    });
    res.status(201).json(batch);
});
router.delete("/:id", auth_js_1.requireAuth, async (req, res) => {
    const authReq = req;
    const id = req.params.id;
    const batch = await db_js_1.prisma.batch.findUnique({ where: { id } });
    if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
    }
    if (batch.creatorId !== authReq.user.id) {
        return res.status(403).json({ error: "Forbidden" });
    }
    await db_js_1.prisma.batch.delete({ where: { id } });
    res.status(204).send();
});
exports.batchesRouter = router;
//# sourceMappingURL=batches.js.map