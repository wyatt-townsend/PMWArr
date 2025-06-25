import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vod } from '@shared/vod.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class VodService {
    // Store VOD entities in a BehaviorSubject for reactive access
    private vodsSubject = new BehaviorSubject<Vod[]>([]);
    private vodEndpoint = '/api/vods'; // Adjust endpoint as needed
    private jobEndpoint = '/api/job'; // Adjust endpoint as needed

    constructor(private http: HttpClient) {
        this.syncVods();
    }

    // Fetch all VOD entities from the backend and update the subject
    syncVods(): void {
        this.http
            .get<Vod[]>(this.vodEndpoint)
            .pipe(
                map((vods) =>
                    vods.map((vod) => ({
                        ...vod,
                        aired: new Date(vod.aired),
                        published: new Date(vod.published),
                        updatedAt: new Date(vod.updatedAt),
                    })),
                ),
            )
            .subscribe({
                next: (vods) => this.vodsSubject.next(vods),
                error: () => this.vodsSubject.next([]),
            });
    }

    // Allow other components to get the current VOD entities as observable
    getVods(): Observable<Vod[]> {
        return this.vodsSubject.asObservable();
    }

    download(vod: Vod): void {
        console.log(`Downloading VOD: ${vod.title} (ID: ${vod.id})`);
        //this.http.post(this.jobEndpoint + '/download/' + vod.id, null);
    }

    sync(date: Date): void {
        console.log(`Syncing VODs from date: ${date}`);
        //this.http.post(this.jobEndpoint + '/sync/?date=' + date.toDateString(), null);
    }
}
