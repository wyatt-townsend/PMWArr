// src/utils/logger.ts
import { pino } from 'pino';
import { config } from './config.util.js';

const transport = pino.transport({
    targets: [
        {
            level: config.LOG_LEVEL,
            target: 'pino/file',
            options: { destination: `${config.CONFIG_DIR}/app.log` },
        },
        {
            level: config.LOG_LEVEL,
            target: 'pino/file',
        },
    ],
});

export const logger = pino(
    {
        level: config.LOG_LEVEL,
        timestamp: pino.stdTimeFunctions.isoTime,
    },
    transport,
);
