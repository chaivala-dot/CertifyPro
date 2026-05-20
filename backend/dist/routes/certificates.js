"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.certificatesRouter = void 0;
const express_1 = __importDefault(require("express"));
const db_js_1 = require("../db.js");
const router = express_1.default.Router();
function isValidCustomFields(value) {
    return typeof value === "object" && value !== null;
}
router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const cert = await db_js_1.prisma.certificate.findUnique({
        where: { id },
        include: {
            batch: {
                include: {
                    template: true,
                },
            },
        },
    });
    if (!cert) {
        return res.status(404).json({ error: "Certificate not found" });
    }
    res.json(cert);
});
router.post("/verify", async (req, res) => {
    const { code } = req.body;
    if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "code is required" });
    }
    const cert = await db_js_1.prisma.certificate.findUnique({
        where: { uniqueCode: code },
        include: {
            batch: {
                include: {
                    template: true,
                },
            },
        },
    });
    if (!cert) {
        return res.status(404).json({ error: "Invalid code" });
    }
    res.json(cert);
});
router.post("/:id/increment-download", async (req, res) => {
    const id = req.params.id;
    const cert = await db_js_1.prisma.certificate.findUnique({ where: { id } });
    if (!cert) {
        return res.status(404).json({ error: "Certificate not found" });
    }
    // Safely parse customFields with type guard
    const existingFields = isValidCustomFields(cert.customFields)
        ? cert.customFields
        : {};
    const currentDownloadCount = typeof existingFields.downloadCount === "number"
        ? existingFields.downloadCount
        : 0;
    const updated = await db_js_1.prisma.certificate.update({
        where: { id },
        data: {
            customFields: {
                ...existingFields,
                downloadCount: currentDownloadCount + 1,
            },
        },
    });
    res.json(updated);
});
exports.certificatesRouter = router;
//# sourceMappingURL=certificates.js.map