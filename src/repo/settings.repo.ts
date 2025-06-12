import sqlite3 from 'sqlite3';
import { getDatabaseConnection } from '../db/connection.db.js';
import { logger } from '../utils/logger.util.js';
import Settings from '../models/settings.model.js';

class SettingsRepo {
    private db: sqlite3.Database;

    constructor() {
        this.db = getDatabaseConnection();
    }

    private parseSettings(row: Settings): Settings {
        return {
            auto_download: Boolean(row.auto_download),
            sync_schedule: row.sync_schedule,
        };
    }

    async get(): Promise<Settings> {
        const query = 'SELECT * FROM settings WHERE id = ?';

        return new Promise((resolve, reject) => {
            this.db.get<Settings>(query, [1], (err, row) => {
                if (err) {
                    logger.error(err.message);
                    reject(err);
                } else if (!row) {
                    resolve(undefined);
                } else {
                    resolve(this.parseSettings(row));
                }
            });
        });
    }

    async set(settings: Settings): Promise<Settings> {
        const query = `
        INSERT INTO settings (id, auto_download, sync_schedule)
        VALUES (?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            auto_download = excluded.auto_download,
            sync_schedule = excluded.sync_schedule
    `;

        return new Promise((resolve, reject) => {
            this.db.run(query, [1, settings.auto_download, settings.sync_schedule], function (err) {
                if (err) {
                    logger.error(err.message);
                    reject(err);
                } else {
                    resolve(settings);
                }
            });
        });
    }
}

export default SettingsRepo;
