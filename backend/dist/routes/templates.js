"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.templatesRouter = void 0;
const express_1 = __importDefault(require("express"));
const db_js_1 = require("../db.js");
const auth_js_1 = require("../middleware/auth.js");
const router = express_1.default.Router();
router.get("/", async (_req, res) => {
    const templates = await db_js_1.prisma.template.findMany({
        orderBy: { createdAt: "desc" },
    });
    res.json(templates);
});
router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const template = await db_js_1.prisma.template.findUnique({ where: { id } });
    if (!template) {
        return res.status(404).json({ error: "Template not found" });
    }
    res.json(template);
});
router.post("/", auth_js_1.requireAuth, async (req, res) => {
    const authReq = req;
    const { name, backgroundUrl, canvasStateJson } = req.body;
    if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "name is required" });
    }
    const canvas = typeof canvasStateJson === "string"
        ? canvasStateJson
        : JSON.stringify(canvasStateJson ?? {});
    const created = await db_js_1.prisma.template.create({
        data: {
            name,
            backgroundUrl: typeof backgroundUrl === "string" ? backgroundUrl : null,
            canvasStateJson: canvas,
            creatorId: authReq.user.id,
        },
    });
    res.status(201).json(created);
});
router.put("/:id", auth_js_1.requireAuth, async (req, res) => {
    const authReq = req;
    const id = req.params.id;
    const { name, backgroundUrl, canvasStateJson } = req.body;
    if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "name is required" });
    }
    const existing = await db_js_1.prisma.template.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ error: "Template not found" });
    }
    if (existing.creatorId !== authReq.user.id) {
        return res.status(403).json({ error: "Forbidden" });
    }
    const canvas = typeof canvasStateJson === "string"
        ? canvasStateJson
        : JSON.stringify(canvasStateJson ?? {});
    const updated = await db_js_1.prisma.template.update({
        where: { id },
        data: {
            name,
            backgroundUrl: typeof backgroundUrl === "string" ? backgroundUrl : null,
            canvasStateJson: canvas,
        },
    });
    res.json(updated);
});
router.delete("/:id", auth_js_1.requireAuth, async (req, res) => {
    const authReq = req;
    const id = req.params.id;
    const existing = await db_js_1.prisma.template.findUnique({ where: { id: id } });
    if (!existing) {
        return res.status(404).json({ error: "Template not found" });
    }
    if (existing.creatorId !== authReq.user.id) {
        return res.status(403).json({ error: "Forbidden" });
    }
    await db_js_1.prisma.template.delete({ where: { id: id } });
    res.status(204).send();
});
exports.templatesRouter = router;
//# sourceMappingURL=templates.js.map