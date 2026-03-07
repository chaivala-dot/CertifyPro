import { NextFunction, Response } from "express";
import { z } from "zod";
import { batchService } from "../services/batch.service.js";
import { AuthedRequest } from "../middleware/auth.js";

const recipientSchema = z.object({
    name: z.string().min(1, "Recipient name is required"),
    email: z.string().email().optional().nullable(),
    customFields: z.unknown().optional(),
});

const createBatchSchema = z.object({
    name: z.string().min(1, "Batch name is required"),
    templateId: z.string().min(1, "Template ID is required"),
    recipients: z.array(recipientSchema).optional(),
});

export const listBatches = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
        const batches = await batchService.listBatches();
        res.json(batches);
    } catch (error) {
        next(error);
    }
};

export const getBatch = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
        const batch = await batchService.getBatch(req.params.id as string);
        if (!batch) {
            return res.status(404).json({ error: "Batch not found" });
        }
        res.json(batch);
    } catch (error) {
        next(error);
    }
};

export const createBatch = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
        const data = createBatchSchema.parse(req.body);
        const created = await batchService.createBatch(req.user.id, data as any);
        res.status(201).json(created);
    } catch (error) {
        next(error);
    }
};

export const deleteBatch = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
        await batchService.deleteBatch(req.params.id as string, req.user.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
