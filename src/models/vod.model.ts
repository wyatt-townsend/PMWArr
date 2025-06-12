enum VodState {
    Error = 'error',
    Discovered = 'discovered',
    Queued = 'queued',
    Downloading = 'downloading',
    Downloaded = 'downloaded',
}

interface Vod {
    readonly id: number;
    readonly title: string;
    readonly part?: number;
    readonly url: string;
    readonly aired: Date;
    readonly published: Date;
    readonly fileSize: number;
    videoFileLocation?: string;
    state: VodState;
    updatedAt: Date;
}

type VodDto = Omit<Vod, 'id' | 'videoFileLocation' | 'updatedAt'>;
export { VodState, Vod, VodDto };
