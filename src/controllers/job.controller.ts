import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.utils.js';
import { HttpStatusCode, ErrorCode } from '../utils/codes.util.js';
import VodService from '../services/vod.service.js';
import JobService from '../services/job.service.js';
import settingsService from '../services/settings.service.js';
import { VodState } from '../models/vod.model.js';

const idSchema = z
    .object({
        id: z.coerce.number().int().positive('ID must be a positive integer'),
    })
    .strict();

const optionSchema = z
    .object({
        date: z.coerce
            .date()
            .optional()
            .default(() => new Date()),
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

        const download = result.data.download ?? (await settingsService.getSettings()).auto_download; // Default to app settings
        const vods = await JobService.doSyncJob(result.data.date, download);
        res.status(HttpStatusCode.CREATED).json(vods);
    } catch (err) {
        return next(err);
    }
};

const enqueueDownload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = idSchema.safeParse(req.params);

    if (!result.success) {
        return next(
            new AppError(`Invalid query param: ${JSON.stringify(result.error.flatten())}`, HttpStatusCode.BAD_REQUEST, ErrorCode.VALIDATION_ERROR),
        );
    }

    try {
        // We only mark the vode as ready for download, the actual download will be handled
        // by the job service in the background.
        const vodService = new VodService();
        const vod = await vodService.findVodById(result.data.id);

        if (vod.state !== VodState.Downloading && vod.state !== VodState.Queued) {
            vod.state = VodState.Queued;
            await vodService.updateVod(vod);
        }

        res.status(HttpStatusCode.ACCEPTED).json(vod);
    } catch (err) {
        return next(err);
    }
};

export default {
    startSyncJob,
    enqueueDownload,
};
