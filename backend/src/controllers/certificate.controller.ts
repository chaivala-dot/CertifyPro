import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { certificateService } from "../services/certificate.service.js";

const verifySchema = z.object({
    code: z.string().min(1, "code is required"),
});

export const getCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cert = await certificateService.getCertificate(req.params.id as string);
        if (!cert) {
            return res.status(404).json({ error: "Certificate not found" });
        }
        res.json(cert);
    } catch (error) {
        next(error);
    }
};

export const verifyCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = verifySchema.parse(req.body);
        const cert = await certificateService.verifyCertificate(code);
        if (!cert) {
            return res.status(404).json({ error: "Invalid code" });
        }
        res.json(cert);
    } catch (error) {
        next(error);
    }
};

export const incrementDownloadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updated = await certificateService.incrementDownloadCount(req.params.id as string);
        res.json(updated);
    } catch (error) {
        next(error);
    }
};
