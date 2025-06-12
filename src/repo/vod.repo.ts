import sqlite3 from 'sqlite3';
import { getDatabaseConnection } from '../db/connection.db.js';
import { logger } from '../utils/logger.util.js';
import { AppError } from '../utils/error.utils.js';
import { Vod, VodDto } from '../models/vod.model.js';

class VodRepo {
    private db: sqlite3.Database;

    constructor() {
        this.db = getDatabaseConnection();
    }

    private parseVodRow(row: Vod): Vod {
        return {
            id: row.id,
            title: row.title,
            part: row.part ?? undefined,
            url: row.url,
            aired: new Date(row.aired),
            published: new Date(row.published),
            fileSize: Number(row.fileSize),
            videoFileLocation: row.videoFileLocation ?? undefined,
            state: row.state,
            updatedAt: new Date(row.updatedAt),
        };
    }

    async findAll(): Promise<Vod[]> {
        const query = 'SELECT * FROM vods';

        return new Promise((resolve, reject) => {
            this.db.all<Vod>(query, [], (err, rows) => {
                if (err) {
                    logger.error(err.message);
                    reject(err);
                } else {
                    resolve(rows.map(this.parseVodRow));
                }
            });
        });
    }

    async findById(id: number): Promise<Vod> {
        const query = 'SELECT * FROM vods WHERE id = ?';

        return new Promise((resolve, reject) => {
            this.db.get<Vod>(query, [id], (err, row) => {
                if (err) {
                    logger.error(err.message);
                    reject(err);
                } else if (!row) {
                    reject(new Error(`Vod with ID ${id} not found`));
                } else {
                    resolve(this.parseVodRow(row));
                }
            });
        });
    }

    async create(vodDto: VodDto): Promise<Vod> {
        const query =
            'INSERT INTO vods (title, part, url, aired, published, fileSize, videoFileLocation, state, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

        const createdTime = new Date();

        return new Promise((resolve, reject) => {
            this.db.run(
                query,
                [vodDto.title, vodDto.part, vodDto.url, vodDto.aired, vodDto.published, vodDto.fileSize, undefined, vodDto.state, createdTime],
                function (err) {
                    if (err) {
                        logger.error(err.message);
                        reject(err);
                    } else {
                        resolve({
                            id: this.lastID,
                            title: vodDto.title,
                            part: vodDto.part,
                            url: vodDto.url,
                            aired: vodDto.aired,
                            published: vodDto.published,
                            fileSize: vodDto.fileSize,
                            videoFileLocation: undefined,
                            state: vodDto.state,
                            updatedAt: createdTime,
                        });
                    }
                },
            );
        });
    }

    async update(vod: Vod): Promise<Vod> {
        const query = 'UPDATE vods SET videoFileLocation = ?, state = ?, updatedAt = ? WHERE id = ?';

        return new Promise((resolve, reject) => {
            this.db.run(query, [vod.videoFileLocation || undefined, vod.state, vod.updatedAt, vod.id], function (err) {
                if (err) {
                    logger.error(err.message);
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error(`Vod with ID ${vod.id} not found`));
                } else {
                    resolve(vod);
                }
            });
        });
    }

    async delete(id: number): Promise<boolean> {
        const query = 'DELETE FROM vods WHERE id = ?';

        return new Promise((resolve, reject) => {
            this.db.run(query, [id], function (err) {
                if (err) {
                    logger.error(err.message);
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new AppError(`Vod with ID ${id} not found`));
                } else {
                    resolve(true);
                }
            });
        });
    }
}

export default VodRepo;
