// scheduler/SchedulerService.ts
import cron from 'node-cron';
import { logger } from '../utils/logger.util.js';
import { JobService } from './job.service.js';
import { VodState } from '../models/vod.model.js';
import VodService from '../services/vod.service.js';

export class SchedulerService {
    private static syncJob: cron.ScheduledTask | null = null;
    private static downloadJob: cron.ScheduledTask | null = null;
    private static syncRunning: boolean = false;
    private static downloadRunning: boolean = false;

    static scheduleSyncJob(schedule: string = '*/15 * * * *') {
        if (this.syncJob) this.syncJob.stop();

        this.syncRunning = false;
        this.syncJob = cron.schedule(schedule, async () => {
            if (this.syncRunning) {
                logger.warn('[Scheduler] Sync job already running, skipping this run');
                return;
            }

            this.syncRunning = true;
            logger.trace(`[Scheduler] Running VOD sync at ${new Date().toISOString()}`);
            await JobService.doSyncJob();
            this.syncRunning = false;
        });

        this.syncJob.start();
    }

    static scheduleDownloadJob(schedule: string = '*/15 * * * * *') {
        if (this.downloadJob) this.downloadJob.stop();

        this.downloadRunning = false;
        this.downloadJob = cron.schedule(schedule, async () => {
            if (this.downloadRunning) {
                logger.warn('[Scheduler] Download job already running, skipping this run');
                return;
            }
            this.downloadRunning = true;
            logger.trace(`[Scheduler] Running VOD download at ${new Date().toISOString()}`);

            let vods = await new VodService().getAllVods();
            vods = vods.filter((vod) => vod.state === VodState.Queued || vod.state === VodState.Error);
            for (const vod of vods) {
                await JobService.doDownloadJob(vod.id);
            }

            this.downloadRunning = false;
        });

        this.downloadJob.start();
    }
}
