// scheduler/SchedulerService.ts
import cron from 'node-cron';
import { logger } from '../utils/logger.util.js';
import { VodState } from '../models/vod.model.js';
import Settings from '../models/settings.model.js';
import JobService from './job.service.js';
import VodService from '../services/vod.service.js';
import settingsService from './settings.service.js';

class SchedulerService {
    private syncJob: cron.ScheduledTask | null = null;
    private downloadJob: cron.ScheduledTask | null = null;
    private syncRunning: boolean = false;
    private downloadRunning: boolean = false;

    scheduleSyncJob(schedule: string) {
        if (this.syncJob) this.syncJob.stop();

        this.syncRunning = false;
        this.syncJob = cron.schedule(schedule, async () => {
            if (this.syncRunning) {
                logger.debug('Sync job already running, skipping this run');
                return;
            }
            this.syncRunning = true; // Start of job

            // We want to check for uploads yesterday, not today
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            // Get auto download settings
            const settings = await settingsService.getSettings();

            logger.trace(`Running sync job at ${new Date().toISOString()}`);
            await JobService.doSyncJob(yesterday, settings.auto_download);

            this.syncRunning = false; // End of job
        });

        this.syncJob.start();
    }

    scheduleDownloadJob(schedule: string) {
        if (this.downloadJob) this.downloadJob.stop();

        this.downloadRunning = false;
        this.downloadJob = cron.schedule(schedule, async () => {
            if (this.downloadRunning) {
                logger.debug('Download job already running, skipping this run');
                return;
            }
            this.downloadRunning = true; // Start of job

            logger.trace(`Running download job at ${new Date().toISOString()}`);

            let vods = await new VodService().getAllVods();
            // This job only runs one at a time so if one is marked as downloading it was interupted and need to be restarted
            vods = vods.filter((vod) => vod.state === VodState.Queued || vod.state === VodState.Downloading);
            for (const vod of vods) {
                await JobService.doDownloadJob(vod.id);
            }
            this.downloadRunning = false; // End of job
        });

        this.downloadJob.start();
    }

    getCronString(sync_day: number, sync_hour: number): string {
        // node-cron uses 0 = Sunday, 6 = Saturday for day of week
        if (sync_day === -1) {
            // Every day at sync_hour
            return `0 ${sync_hour} * * *`;
        } else {
            // Only on specific day at sync_hour
            return `0 ${sync_hour} * * ${sync_day}`;
        }
    }

    rescheduleJobs(settings: Settings) {
        // Stop and restart jobs with new settings
        this.scheduleSyncJob(this.getCronString(settings.sync_day, settings.sync_hour));
    }
}

export default new SchedulerService();
