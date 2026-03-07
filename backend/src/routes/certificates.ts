import express from "express";
import {
  getCertificate,
  verifyCertificate,
  incrementDownloadCount,
} from "../controllers/certificate.controller.js";

const router = express.Router();

router.get("/:id", getCertificate);
router.post("/verify", verifyCertificate);
router.post("/:id/increment-download", incrementDownloadCount);

export const certificatesRouter = router;
