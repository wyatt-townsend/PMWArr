import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Temp } from '../../temp.model'; // Adjust the import path as necessary

@Injectable({
    providedIn: 'root',
})
export class VodService {
    // Store VOD entities in a BehaviorSubject for reactive access
    private vodsSubject = new BehaviorSubject<Temp[]>([]);
    private endpoint = '/api/vods'; // Adjust endpoint as needed

    constructor()
    {
        this.syncVods(new Date());
    }

    // Fetch all VOD entities from the backend and update the subject
    syncVods(date: Date): void {
        this.vodsSubject.next([
        {
            id: 1,
            title: 'Example VOD 1',
            aired: new Date(2025, 5, 18),
            status: 'Discovered',
        },
        {
            id: 2,
            title: 'Example VOD 2',
            aired: new Date(2025, 5, 19),
            status: 'Downloaded',
        },
        {
            id: 3,
            title: 'Example VOD 3',
            aired: new Date(2025, 5, 20),
            status: 'Downloading',
        },
        {
            id: 4,
            title: 'Example VOD 4',
            aired: new Date(2025, 5, 21),
            status: 'Error',
        },
        ]);
    }

    // Allow other components to get the current VOD entities as observable
    getVods(): Observable<Temp[]> {
        return this.vodsSubject.asObservable();
    }
}
