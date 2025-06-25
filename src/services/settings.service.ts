import Settings from '../models/settings.model.js';
import SettingsRepo from '../repo/settings.repo.js';
import schedulerService from './scheduler.service.js';

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
        this.cache = await this.settingsRepo.set(newSettings);

        // Notify scheduler to update jobs
        schedulerService.rescheduleJobs(this.cache);

        return this.cache;
    }
}

export default new SettingsService();
