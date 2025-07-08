// scheduler/SchedulerService.ts
import { logger } from '../utils/logger.util.js';
import { AppError } from '../utils/error.utils.js';
import { HttpStatusCode, ErrorCode } from '../utils/codes.util.js';
import VodService from '../services/vod.service.js';
import PMWService from './pmw.service.js';
import { Vod, VodState } from '../models/vod.model.js';
import { NotificationTopic, NotificationType } from '../models/notification.model.js';
import NotificationService from '../services/notification.service.js';

class JobService {
    static async doSyncJob(target: Date, download: boolean): Promise<Vod[]> {
        logger.debug(`Starting sync job for target date: ${target.toISOString()}`);

        try {
            const ret = [];
            const vods = await PMWService.sync(target);
            logger.trace(`Fetched ${vods.length} VODs from PMW`);

            const vodService = new VodService();

            for (const vodDto of vods) {
                try {
                    if (download) {
                        vodDto.state = VodState.Queued;
                    }

                    const vod = await vodService.createVod(vodDto);
                    ret.push(vod);

                    logger.debug(`Created VOD with ID: ${vod.id}`);
                } catch (error) {
                    logger.debug(`Failed to create VOD: ${error.message}`);
                }
            }

            NotificationService.notify(NotificationTopic.SYNC, {
                type: NotificationType.SUCCESS,
                message: `Found ${ret.length} new VODs on ${target.toDateString()}`,
            });

            return ret;
        } catch (error) {
            NotificationService.notify(NotificationTopic.SYNC, {
                type: NotificationType.ERROR,
                message: `Failed to sync VODs for ${target.toDateString()}`,
            });

            throw new AppError(`Error during sync job: ${error.message}`, HttpStatusCode.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    static async doDownloadJob(id: number): Promise<Vod> {
        logger.debug(`Starting download job for VOD ID: ${id}`);

        const vodService = new VodService();

        try {
            const target = await vodService.findVodById(id);

            NotificationService.notify(NotificationTopic.DOWNLOAD, {
                type: NotificationType.SUCCESS,
                message: `Downloading ${target.title}`,
            });

            target.state = VodState.Downloading;
            await vodService.updateVod(target);

            try {
                const updatedVod = await PMWService.download(target);
                logger.debug(`Downloaded VOD with ID: ${updatedVod.id}`);

                NotificationService.notify(NotificationTopic.DOWNLOAD, {
                    type: NotificationType.SUCCESS,
                    message: `Finished downloading ${target.title}`,
                });
                return vodService.updateVod(updatedVod);
            } catch (error) {
                logger.error(`Error downloading VOD with ID ${target.id}: ${error.message}`);
                NotificationService.notify(NotificationTopic.DOWNLOAD, {
                    type: NotificationType.ERROR,
                    message: `Failed downloading ${target.title}`,
                });
                target.state = VodState.Error;
                return vodService.updateVod(target);
            }
        } catch (error) {
            NotificationService.notify(NotificationTopic.DOWNLOAD, {
                type: NotificationType.ERROR,
                message: `Failed downloading`,
            });
            throw new AppError(
                `Error fetching VOD with ID ${id}: ${error.message}`,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                ErrorCode.INTERNAL_SERVER_ERROR,
            );
        }
    }
}

export default JobService;
