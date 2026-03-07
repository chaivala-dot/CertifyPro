import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../controllers/template.controller.js";

const router = express.Router();

router.get("/", listTemplates as any);
router.get("/:id", getTemplate as any);
router.post("/", requireAuth, createTemplate as any);
router.put("/:id", requireAuth, updateTemplate as any);
router.delete("/:id", requireAuth, deleteTemplate as any);

export const templatesRouter = router;
