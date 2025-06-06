// config.util.ts
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file (defaults to project root)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ConfigSchema = z.object({
    PORT: z.coerce.number().default(3000),
    DATA_DIR: z.string(),
    LOG_LEVEL: z.string().optional().default('info'),
    WORKERS: z.coerce.number().optional().default(4),
    JOB_POLL_INTERVAL_MS: z.coerce.number().optional().default(2000), // 2 seconds
});

// Validate and parse config
const parsed = ConfigSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1); // Crash early
}

/**
 * Configuration object for the application
 * @property {number} PORT - The port the server will run on
 * @property {string} DATA_DIR - The folder where data will be stored
 * @property {string} LOG_LEVEL - The logging level for the application
 * @property {number} WORKERS - The max number of worker threads to spawn
 */
export const config = parsed.data;
