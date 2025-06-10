import { z } from 'zod';
import cron from 'node-cron';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.utils.js';
import { HttpStatusCode, ErrorCode } from '../utils/codes.util.js';
import Settings from '../models/settings.model.js';
import settingsService from '../services/settings.service.js';

const settingsSchema = z
    .object({
        auto_download: z.boolean(),
        sync_schedule: z.string(),
    })
    .strict();

const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const settings = await settingsService.getSettings();
        res.status(HttpStatusCode.OK).json(settings);
    } catch (err) {
        return next(err);
    }
};

const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = settingsSchema.safeParse(req.body);

        if (!result.success) {
            return next(
                new AppError(
                    `Invalid request body: ${JSON.stringify(result.error.flatten())}`,
                    HttpStatusCode.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                ),
            );
        }

        if (!cron.validate(result.data.sync_schedule)) {
            return next(new AppError(`Invalid cron schedule: ${result.data.sync_schedule}`, HttpStatusCode.BAD_REQUEST, ErrorCode.VALIDATION_ERROR));
        }

        const newSettings: Settings = {
            auto_download: result.data.auto_download,
            sync_schedule: result.data.sync_schedule,
        };

        const settings = await settingsService.updateSettings(newSettings);

        res.status(HttpStatusCode.CREATED).json(settings);
    } catch (err) {
        return next(err);
    }
};

export default {
    getSettings,
    updateSettings,
};
