import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listBatches,
  getBatch,
  createBatch,
  deleteBatch,
} from "../controllers/batch.controller.js";

const router = express.Router();

router.get("/", listBatches as any);
router.get("/:id", getBatch as any);
router.post("/", requireAuth, createBatch as any);
router.delete("/:id", requireAuth, deleteBatch as any);

export const batchesRouter = router;
