import cors from 'cors';
import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { fileURLToPath } from 'url';
import { logger } from './utils/logger.util.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { loggerMiddleware } from './middleware/log.middleware.js';
import { runMigrations } from './db/migrations.db.js';

import settingsService from './services/settings.service.js';
import schedulerService from './services/scheduler.service.js';
import notificationService from './services/notification.service.js';

import vodRoute from './routes/vod.route.js';
import jobRoute from './routes/job.route.js';
import settingsRoute from './routes/settings.route.js';

const startServer = async () => {
    const app = express();
    const httpServer = createServer(app);
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    // Initialize the database and run migrations
    await runMigrations();

    // Initialize the services
    notificationService.registerSocket(io);

    const settings = await settingsService.getSettings();
    schedulerService.scheduleDownloadJob('*/10 * * * * *'); // Every 10 seconds
    schedulerService.scheduleSyncJob(schedulerService.getCronString(settings.sync_day, settings.sync_hour));

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
    httpServer.listen(3000, '0.0.0.0', () => logger.info(`Server is running on port ${3000}`));
};

// Start the server
startServer();
