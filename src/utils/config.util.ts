// config.util.ts
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file (defaults to project root)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ConfigSchema = z.object({
    PORT: z.coerce.number().default(3000),
    LOG_LEVEL: z.string().optional().default('info'),
    CONFIG_DIR: z.string().optional().default(path.resolve(process.cwd(), '.config')),
    MEDIA_DIR: z.string().optional().default(path.resolve(process.cwd(), '.media')),
});

// Validate and parse config
const parsed = ConfigSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1); // Crash early
}

/**
 * Application configuration object.
 * @property {number} PORT - The port the application listens on.
 * @property {string} LOG_LEVEL - The logging level (e.g., 'info', 'debug').
 * @property {string} CONFIG_DIR - The directory for configuration files.
 * @property {string} MEDIA_DIR - The directory for media files.
 */
export const config = parsed.data;
