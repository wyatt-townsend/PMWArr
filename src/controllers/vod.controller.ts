import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.utils.js';
import { HttpStatusCode, ErrorCode } from '../utils/codes.util.js';
import VodService from '../services/vod.service.js';

const idSchema = z
    .object({
        id: z.coerce.number().int().positive('ID must be a positive integer'),
    })
    .strict();

const getVods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const vodService = new VodService();
        const vods = await vodService.getAllVods();

        res.status(HttpStatusCode.OK).json(vods);
    } catch (err) {
        return next(err);
    }
};

const getVodById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = idSchema.safeParse(req.params);

    if (!result.success) {
        return next(
            new AppError(`Invalid request param: ${JSON.stringify(result.error.flatten())}`, HttpStatusCode.BAD_REQUEST, ErrorCode.VALIDATION_ERROR),
        );
    } else {
        const { id } = result.data;
        try {
            const vodService = new VodService();
            const vod = await vodService.findVodById(id);

            res.status(HttpStatusCode.OK).json(vod);
        } catch (err) {
            return next(err);
        }
    }
};

const deleteVod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = idSchema.safeParse(req.params);

    if (!result.success) {
        return next(
            new AppError(`Invalid request param: ${JSON.stringify(result.error.flatten())}`, HttpStatusCode.BAD_REQUEST, ErrorCode.VALIDATION_ERROR),
        );
    } else {
        const { id } = result.data;
        try {
            const vodService = new VodService();
            await vodService.deleteVod(id);

            res.status(HttpStatusCode.NO_CONTENT).json({});
        } catch (err) {
            return next(err);
        }
    }
};

export default {
    getVods,
    getVodById,
    deleteVod,
};
