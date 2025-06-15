import * as fs from 'fs';
import VodRepo from '../repo/vod.repo.js';
import { AppError } from '../utils/error.utils.js';
import { HttpStatusCode, ErrorCode } from '../utils/codes.util.js';
import { Vod, VodDto } from '../models/vod.model.js';

class VodService {
    private vodRepo: VodRepo;

    constructor() {
        this.vodRepo = new VodRepo();
    }

    async getAllVods(): Promise<Vod[]> {
        try {
            return await this.vodRepo.findAll();
        } catch {
            throw new AppError('Failed to fetch vods', HttpStatusCode.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    async findVodById(id: number): Promise<Vod> {
        try {
            return await this.vodRepo.findById(id);
        } catch (err) {
            if (err instanceof Error && err.message.includes('not found')) {
                throw new AppError(`Vod with ID ${id} not found`, HttpStatusCode.NOT_FOUND, ErrorCode.VOD_NOT_FOUND);
            }
            throw new AppError(`Failed to fetch vod with ID ${id}`, HttpStatusCode.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    async createVod(vodDto: VodDto): Promise<Vod> {
        try {
            return await this.vodRepo.create(vodDto);
        } catch (err) {
            if (err instanceof Error && err.message.includes('UNIQUE constraint')) {
                throw new AppError('Vod already exists', HttpStatusCode.CONFLICT, ErrorCode.VOD_ALREADY_EXISTS);
            }
            throw new AppError('Failed to create vod', HttpStatusCode.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    async updateVod(vod: Vod): Promise<Vod> {
        try {
            return await this.vodRepo.update(vod);
        } catch (err) {
            if (err instanceof Error && err.message.includes('not found')) {
                throw new AppError(`Vod with ID ${vod.id} not found`, HttpStatusCode.NOT_FOUND, ErrorCode.VOD_NOT_FOUND);
            }
            throw new AppError(`Failed to update vod with ID ${vod.id}`, HttpStatusCode.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteVod(id: number): Promise<boolean> {
        try {
            const vod = await this.findVodById(id);

            if (vod.videoFileLocation) {
                // If the vod is downloaded, delete the video file
                fs.unlinkSync(vod.videoFileLocation);
            }

            return await this.vodRepo.delete(id);
        } catch (err) {
            if (err instanceof AppError) {
                throw err;
            } else {
                throw new AppError(`Failed to delete vod with ID ${id}`, HttpStatusCode.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR);
            }
        }
    }
}

export default VodService;
