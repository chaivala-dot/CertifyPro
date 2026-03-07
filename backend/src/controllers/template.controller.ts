import { NextFunction, Response } from "express";
import { z } from "zod";
import { templateService } from "../services/template.service.js";
import { AuthedRequest } from "../middleware/auth.js";

const templateSchema = z.object({
    name: z.string().min(1, "name is required"),
    backgroundUrl: z.string().url().optional().nullable(),
    canvasStateJson: z.unknown().optional(),
});

export const listTemplates = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
        const templates = await templateService.listTemplates();
        res.json(templates);
    } catch (error) {
        next(error);
    }
};

export const getTemplate = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
        const template = await templateService.getTemplate(req.params.id as string);
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }
        res.json(template);
    } catch (error) {
        next(error);
    }
};

export const createTemplate = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
        const data = templateSchema.parse(req.body);
        const created = await templateService.createTemplate(req.user.id, data as any);
        res.status(201).json(created);
    } catch (error) {
        next(error);
    }
};

export const updateTemplate = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
        const data = templateSchema.parse(req.body);
        const updated = await templateService.updateTemplate(req.params.id as string, req.user.id, data as any);
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const deleteTemplate = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
        await templateService.deleteTemplate(req.params.id as string, req.user.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
