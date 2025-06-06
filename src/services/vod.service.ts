import VodRepo from '../repo/vod.repo.js';
import { AppError } from '../utils/error.utils.js';
import { HttpStatusCode, ErrorCode } from '../utils/codes.util.js';
import { Vod, VodDto, VodState } from '../models/vod.model.js';

class VodService {
    private vodRepo: VodRepo;

    constructor() {
        this.vodRepo = new VodRepo();
    }

    async getAllVods(): Promise<Vod[]> {
        try {
            return await this.vodRepo.findAll();
        } catch (err: any) {
            throw new AppError('Failed to fetch vods', HttpStatusCode.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    async findVodById(id: number): Promise<Vod> {
        try {
            return await this.vodRepo.findById(id);
        } catch (err: any) {
            if (err.message.includes('not found')) {
                throw new AppError(`Vod with ID ${id} not found`, HttpStatusCode.NOT_FOUND, ErrorCode.VOD_NOT_FOUND);
            }
            throw new AppError(`Failed to fetch vod with ID ${id}`, HttpStatusCode.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    async createVod(vodDto: VodDto): Promise<Vod> {
        try {
            return await this.vodRepo.create(vodDto);
        } catch (err: any) {
            if (err.message.includes('UNIQUE constraint')) {
                throw new AppError('Vod already exists', HttpStatusCode.CONFLICT, ErrorCode.VOD_ALREADY_EXISTS);
            }
            throw new AppError('Failed to create vod', HttpStatusCode.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteVod(id: number): Promise<boolean> {
        try {
            // TODO: Need to delete the video file from disk if it exists
            return await this.vodRepo.delete(id);
        } catch (err: any) {
            if (err.message.includes('not found')) {
                throw new AppError(`Vod with ID ${id} not found`, HttpStatusCode.NOT_FOUND, ErrorCode.VOD_NOT_FOUND);
            }
            throw new AppError(`Failed to delete vod with ID ${id}`, HttpStatusCode.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}

export default VodService;
