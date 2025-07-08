import Settings from '../models/settings.model.js';
import SettingsRepo from '../repo/settings.repo.js';
import schedulerService from './scheduler.service.js';

import { NotificationTopic, NotificationType } from '../models/notification.model.js';
import NotificationService from '../services/notification.service.js';

class SettingsService {
    private cache: Settings = null;
    private settingsRepo: SettingsRepo;

    constructor() {
        this.settingsRepo = new SettingsRepo();
    }

    async getSettings(): Promise<Settings> {
        if (!this.cache) {
            try {
                this.cache = await this.settingsRepo.get();
                if (!this.cache) {
                    throw new Error('Settings not found');
                    // Throw so it will be caught and default values will be used
                }
            } catch {
                // If there is an error fetching settings, use default values
                this.cache = {
                    auto_download: true,
                    sync_day: -1, // Default to daily
                    sync_hour: 6, // Default to 6am
                };
            }
        }
        return this.cache;
    }

    async updateSettings(newSettings: Settings): Promise<Settings> {
        try {
            this.cache = await this.settingsRepo.set(newSettings);

            // Notify scheduler to update jobs
            schedulerService.rescheduleJobs(this.cache);

            NotificationService.notify(NotificationTopic.SETTINGS, {
                type: NotificationType.SUCCESS,
                message: `Settings updated successfully`,
            });
        } catch (err) {
            NotificationService.notify(NotificationTopic.SETTINGS, {
                type: NotificationType.ERROR,
                message: `Settings failed to update`,
            });

            throw new Error(`Failed to update settings: ${err.message}`);
        }

        return this.cache;
    }
}

export default new SettingsService();
