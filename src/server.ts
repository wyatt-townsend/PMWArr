import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './utils/config.util.js';
import { logger } from './utils/logger.util.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { loggerMiddleware } from './middleware/log.middleware.js';
import { runMigrations } from './db/migrations.db.js';
import settingsService from './services/settings.service.js';
import schedulerService from './services/scheduler.service.js';

import vodRoute from './routes/vod.route.js';
import jobRoute from './routes/job.route.js';
import settingsRoute from './routes/settings.route.js';

const startServer = async () => {
    const app = express();

    // Initialize the database and run migrations
    await runMigrations();

    // Initialize the jobs
    const settings = await settingsService.getSettings();
    schedulerService.scheduleDownloadJob('*/10 * * * * *'); // Every 10 seconds
    schedulerService.scheduleSyncJob(settings.sync_schedule);

    // Resolve __dirname equivalent
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Add middleware
    app.use(cors());
    app.use(express.json());
    app.use(loggerMiddleware);

    // Serve static files from the "public" directory
    app.use(express.static(path.join(__dirname, '../frontend/dist/frontend/browser')));

    // Set up routes
    app.use('/api/vods/', vodRoute);
    app.use('/api/job/', jobRoute);
    app.use('/api/settings/', settingsRoute);

    // Add error handling middleware
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Run the server
    app.listen(config.PORT, '0.0.0.0', () => logger.info(`Server is running on port ${config.PORT}`));
};

// Start the server
startServer();
