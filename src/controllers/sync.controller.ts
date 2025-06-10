import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.utils.js';
import { HttpStatusCode, ErrorCode } from '../utils/codes.util.js';
import JobService from '../services/job.service.js';
import settingsService from '../services/settings.service.js';

const optionSchema = z
    .object({
        date: z
            .string()
            .optional()
            .default(() => new Date().toISOString()),
        download: z
            .string()
            .transform((value) => {
                if (value === 'true') {
                    return true;
                } else if (value === 'false') {
                    return false;
                } else {
                    throw new AppError(
                        `Invalid query param: 'download' must be 'true' or 'false'`,
                        HttpStatusCode.BAD_REQUEST,
                        ErrorCode.VALIDATION_ERROR,
                    );
                }
            })
            .optional(),
    })
    .strict();

const startSyncJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = optionSchema.safeParse(req.query);

        if (!result.success) {
            return next(
                new AppError(
                    `Invalid query param: ${JSON.stringify(result.error.flatten())}`,
                    HttpStatusCode.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                ),
            );
        }
        console.log(result.data);

        const download = result.data.download ?? (await settingsService.getSettings()).auto_download; // Default to app settings
        const vods = await JobService.doSyncJob(new Date(result.data.date), download);
        res.status(HttpStatusCode.CREATED).json(vods);
    } catch (err) {
        return next(err);
    }
};

export default {
    startSyncJob,
};
