export interface Temp {
    id: number;
    title: string;
    aired: Date;
    status: 'Discovered' | 'Downloaded' | 'Downloading' | 'Error';
}