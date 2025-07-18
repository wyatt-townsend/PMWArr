import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import * as fs from 'fs';
import { logger } from '../utils/logger.util.js';

ffmpeg.setFfmpegPath(ffmpegPath);

class MediaService {
    static async writeMp4Title(filePath: string, title: string): Promise<void> {
        const dir = path.dirname(filePath);
        const tempFilePath = path.join(dir, `temp_${path.basename(filePath)}`);

        logger.debug(`Writing MP4 title metadata to ${filePath} with title "${title}"`);
        await new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .outputOptions('-metadata', `title=${title}`, '-codec', 'copy')
                .on('end', () => {
                    logger.debug(`MP4 title metadata written successfully to ${filePath}`);
                    resolve(null);
                })
                .on('error', (err) => {
                    logger.error(`Error writing MP4 title metadata: ${err.message}`);
                    reject(err);
                })
                .save(tempFilePath);
        });

        fs.rename(tempFilePath, filePath, (err) => {
            if (err) {
                logger.error(`Error renaming temp file: ${err.message}`);
                throw err;
            }
        });
    }
}

export default MediaService;
