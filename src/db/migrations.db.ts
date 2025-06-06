import { getDatabaseConnection } from './connection.db.js';
import { logger } from '../utils/logger.util.js';

/**
 * Run database migrations to ensure the database schema is up to date.
 */
export async function runMigrations(): Promise<void> {
    const db = await getDatabaseConnection();

    // Create the vods table if it doesn't exist
    db.exec(
        `
    CREATE TABLE IF NOT EXISTS vods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT UNIQUE NOT NULL,
        aired DATETIME NOT NULL,
        published DATETIME NOT NULL,
        fileSize INTEGER NOT NULL,
        videoFileLocation TEXT,
        state INTEGER NOT NULL,
        updatedAt DATETIME NOT NULL,
    );
    `,
        (err) => {
            if (err) {
                logger.error('Error creating vods table: ' + err.message);
            }
        },
    );

    db.close();
}
