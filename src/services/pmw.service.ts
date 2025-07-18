import axios from 'axios';
import * as fs from 'fs';
import * as cheerio from 'cheerio';
import { config } from '../utils/config.util.js';
import { VodDto, Vod, VodState } from '../models/vod.model.js';
import MediaService from './media.service.js';

class PMWService {
    private static url: string = 'https://archive.wubby.tv/vods/public/';

    static isSameDay(a: Date, b: Date): boolean {
        return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();
    }

    static getUrlByDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.toLocaleDateString('en-US', { month: 'short' })).toLowerCase();
        return `${this.url}${month}_${year}/`;
    }

    static getFileName(vod: Vod): string {
        let fileName: string = `PaymoneyWubby Streams - ${vod.aired.toISOString().slice(0, 10)}`;

        if (vod.part !== undefined) {
            fileName += ` - part${vod.part}`;
        }

        fileName += '.mp4';

        return fileName;
    }

    static parseFileSize(size: string): number {
        // Example: "1.2 GiB" or "500 MiB"
        const sizeParts = size.split(' ');

        if (sizeParts.length < 1) {
            return 0; // Return 0 if size is empty or invalid
        } else if (sizeParts.length == 1) {
            return parseFloat(sizeParts[0]);
        }

        const value = parseFloat(sizeParts[0]);
        const unit = sizeParts[1].toUpperCase();

        switch (unit) {
            case 'GIB':
                return value * 1024 * 1024 * 1024; // Convert GiB to bytes
            case 'MIB':
                return value * 1024 * 1024; // Convert MiB to bytes
            case 'KIB':
                return value * 1024; // Convert KiB to bytes
            default:
                return value; // Assume bytes if no unit is specified
        }
    }

    static async sync(target: Date): Promise<VodDto[]> {
        const url = this.getUrlByDate(target);
        const response = await axios.get(url);
        if (response.status !== 200) {
            throw new Error(`Failed to fetch data from ${url}`);
        }

        const html = response.data;
        const $ = cheerio.load(html);

        let parts = 1;
        const vods: VodDto[] = [];
        $('tr').each((_, el) => {
            const linkTd = $(el).find('td.link');
            const sizeTd = $(el).find('td.size');
            const dateTd = $(el).find('td.date');

            // Skip rows without required data
            if (!linkTd.length || !sizeTd.length || !dateTd.length || sizeTd.text() === '-') return;

            const titleFull = linkTd.find('a').attr('title').trim();
            const titleParts = titleFull.split('_');

            if (titleParts.length < 2) return; // Skip if title does not have enough parts
            const title = titleParts[1].trim();
            const part = parts;
            const aired = new Date(Date.UTC(target.getFullYear(), target.getMonth(), parseInt(titleParts[0].trim())));
            const link = linkTd.find('a').attr('href') || '';
            const size = this.parseFileSize(sizeTd.text().trim());

            // Need to convert the date to UTC
            const temp = new Date(dateTd.text().trim());
            const published = new Date(
                Date.UTC(temp.getFullYear(), temp.getMonth(), temp.getDate(), temp.getHours(), temp.getMinutes(), temp.getSeconds()),
            );

            if (!this.isSameDay(aired, target)) return; // Skip if date does not match target

            vods.push({
                title: title,
                part: part,
                url: url + link,
                state: VodState.Discovered,
                aired: aired,
                published: published,
                fileSize: size,
            });

            parts++;
        });

        if (vods.length === 1) {
            // If only one VOD is found, set part to undefined
            vods[0] = {
                ...vods[0],
                part: undefined,
            };
        }

        return vods;
    }

    static async download(target: Vod): Promise<Vod> {
        const outputDirectory = `${config.MEDIA_DIR}/PaymoneyWubby Streams/${target.aired.getFullYear()}/`;
        // Ensure the output directory exists
        fs.mkdirSync(outputDirectory, { recursive: true });

        const filePath = outputDirectory + this.getFileName(target);

        const writer = fs.createWriteStream(filePath);
        const response = await axios.get(target.url, { responseType: 'stream' });
        response.data.pipe(writer);

        try {
            await new Promise<void>((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            target.videoFileLocation = filePath;
            target.state = VodState.Downloaded;

            // Set MP4 title metadata using ffmpeg
            await MediaService.writeMp4Title(filePath, target.title);
        } catch {
            target.videoFileLocation = undefined;
            target.state = VodState.Error;
        }

        return target;
    }
}

export default PMWService;
