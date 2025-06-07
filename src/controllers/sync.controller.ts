import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.utils.js';
import { HttpStatusCode, ErrorCode } from '../utils/codes.util.js';
import { JobService } from '../services/job.service.js';

// Schema for validating optional date in query
const dateSchema = z
    .object({
        date: z.string().optional(),
    })
    .strict();

const startSyncJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = dateSchema.safeParse(req.query);

    if (!result.success) {
        return next(
            new AppError(`Invalid query param: ${JSON.stringify(result.error.flatten())}`, HttpStatusCode.BAD_REQUEST, ErrorCode.VALIDATION_ERROR),
        );
    }

    let targetDate: Date | undefined = undefined;
    if (result.data.date) {
        const parsed = new Date(result.data.date);
        if (isNaN(parsed.getTime())) {
            return next(new AppError(`Invalid date format: ${result.data.date}`, HttpStatusCode.BAD_REQUEST, ErrorCode.VALIDATION_ERROR));
        }
        targetDate = parsed;
    }

    try {
        const vods = await JobService.doSyncJob(targetDate);
        res.status(HttpStatusCode.OK).json(vods);
    } catch (err) {
        return next(err);
    }
};

export default {
    startSyncJob,
};
