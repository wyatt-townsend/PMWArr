import fs from 'fs';
import sqlite3 from 'sqlite3';
import { logger } from '../utils/logger.util.js';
import { config } from '../utils/config.util.js';

// Ensure data folder exists
fs.mkdirSync(config.CONFIG_DIR, { recursive: true });

/**
 * Function to get a sqlite3 database connection
 */
export function getDatabaseConnection(): sqlite3.Database {
    return new sqlite3.Database(config.CONFIG_DIR + 'database.sqlite3', (err) => {
        if (err) {
            logger.error(err.message);
        }
    });
}

export default getDatabaseConnection;
