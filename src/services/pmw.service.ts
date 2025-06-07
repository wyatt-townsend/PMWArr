import { VodDto, Vod, VodState } from '../models/vod.model.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class PMWService {
    private static url: string = 'https://archive.wubby.tv/';

    static async sync(target: Date): Promise<VodDto[]> {
        const demo: VodDto = {
            title: 'Example VOD' + target.toISOString(),
            url: 'https://example.com/vod.mp4 ' + target.toISOString(),
            aired: target,
            published: new Date('2023-01-02T00:00:00Z'),
            fileSize: 123456789,
        };

        return [demo];
    }

    static async download(target: Vod): Promise<Vod> {
        await sleep(20000); // Simulate network delay
        target.videoFileLocation = `${this.url}${target.id}.mp4`;
        target.state = VodState.Downloaded;

        return target;
    }
}

export default PMWService;
