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
            this.cache = (await this.settingsRepo.get()) ?? {
                auto_download: true,
                sync_schedule: '0 6 * * *',
            };
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
