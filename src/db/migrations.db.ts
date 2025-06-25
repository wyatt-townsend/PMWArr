import { getDatabaseConnection } from './connection.db.js';
import { logger } from '../utils/logger.util.js';

function execAsync(db, sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export async function runMigrations(): Promise<void> {
    const db = await getDatabaseConnection();

    try {
        await execAsync(
            db,
            `
            CREATE TABLE IF NOT EXISTS vods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                part INTEGER CHECK (part >= 0),
                url TEXT UNIQUE NOT NULL,
                aired DATETIME NOT NULL,
                published DATETIME NOT NULL,
                fileSize INTEGER NOT NULL,
                videoFileLocation TEXT,
                state INTEGER NOT NULL,
                updatedAt DATETIME NOT NULL
            );
        `,
        );

        await execAsync(
            db,
            `
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                auto_download BOOLEAN NOT NULL,
                sync_day INTEGER NOT NULL CHECK (sync_day >= -1 AND sync_day <= 6),
                sync_hour INTEGER NOT NULL CHECK (sync_hour >= 0 AND sync_hour <= 23)
            );
        `,
        );
    } catch (err) {
        logger.error('Migration error: ' + err.message);
        throw err;
    } finally {
        db.close();
    }
}
