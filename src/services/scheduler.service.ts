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
            vods = vods.filter((vod) => vod.state === VodState.Queued);
            for (const vod of vods) {
                await JobService.doDownloadJob(vod.id);
            }
            this.downloadRunning = false; // End of job
        });

        this.downloadJob.start();
    }

    rescheduleJobs(settings: Settings) {
        // Stop and restart jobs with new settings
        this.scheduleSyncJob(settings.sync_schedule);
    }
}

export default new SchedulerService();
