import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.utils.js';
import { HttpStatusCode, ErrorCode } from '../utils/codes.util.js';
import VodService from '../services/vod.service.js';
import { VodState } from '../models/vod.model.js';

const idSchema = z
    .object({
        id: z.coerce.number().int().positive('ID must be a positive integer'),
    })
    .strict();

const enqueueDownload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = idSchema.safeParse(req.params);

    if (!result.success) {
        return next(
            new AppError(`Invalid query param: ${JSON.stringify(result.error.flatten())}`, HttpStatusCode.BAD_REQUEST, ErrorCode.VALIDATION_ERROR),
        );
    }

    try {
        const vodService = new VodService();
        const vod = await vodService.findVodById(result.data.id);

        if (vod.state !== VodState.Downloading && vod.state !== VodState.Queued) {
            vod.state = VodState.Queued;
            await vodService.updateVod(vod);
        }

        res.status(HttpStatusCode.CREATED).json(vod);
    } catch (err) {
        return next(err);
    }
};

export default {
    enqueueDownload,
};
