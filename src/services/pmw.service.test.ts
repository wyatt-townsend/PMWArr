import { describe, it, expect } from 'vitest';
import PMWService from './pmw.service.js';
import { Vod, VodState } from '../models/vod.model.js';

describe('PMWService', () => {
    describe('isSameDay', () => {
        it('should return true for same UTC day', () => {
            const a = new Date(Date.UTC(2024, 5, 10, 12, 0, 0));
            const b = new Date(Date.UTC(2024, 5, 10, 23, 59, 59));
            expect(PMWService.isSameDay(a, b)).toBe(true);
        });

        it('should return false for different days', () => {
            const a = new Date(Date.UTC(2024, 5, 10));
            const b = new Date(Date.UTC(2024, 5, 11));
            expect(PMWService.isSameDay(a, b)).toBe(false);
        });
    });

    describe('getUrlByDate', () => {
        it('should return correct URL for June 2024', () => {
            const date = new Date(2024, 5, 10); // June is month 5 (0-based)
            expect(PMWService.getUrlByDate(date)).toContain('https://archive.wubby.tv/vods/public/jun_2024/');
        });
    });

    describe('getFileName', () => {
        it('should generate filename with part', () => {
            const vod: Vod = {
                id: 123,
                title: 'Test',
                part: 2,
                url: '',
                state: VodState.Discovered,
                aired: new Date('2024-06-10T00:00:00Z'),
                published: new Date(),
                fileSize: 123,
                updatedAt: new Date(),
            };
            expect(PMWService.getFileName(vod)).toContain('part2');
        });

        it('should generate filename without part', () => {
            const vod: Vod = {
                id: 123,
                title: 'Test',
                part: undefined,
                url: '',
                state: VodState.Discovered,
                aired: new Date('2024-06-10T00:00:00Z'),
                published: new Date(),
                fileSize: 123,
                updatedAt: new Date(),
            };
            expect(PMWService.getFileName(vod)).not.toContain('part');
        });
    });

    describe('parseFileSize', () => {
        it('should parse GiB', () => {
            expect(PMWService.parseFileSize('1.5 GiB')).toBeCloseTo(1.5 * 1024 * 1024 * 1024);
        });

        it('should parse MiB', () => {
            expect(PMWService.parseFileSize('500 MiB')).toBeCloseTo(500 * 1024 * 1024);
        });

        it('should parse KiB', () => {
            expect(PMWService.parseFileSize('100 KiB')).toBeCloseTo(100 * 1024);
        });

        it('should parse bytes if no unit', () => {
            expect(PMWService.parseFileSize('123')).toBe(123);
        });
    });
});
