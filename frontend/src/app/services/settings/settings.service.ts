import { Injectable } from '@angular/core';
import Settings from '@shared/settings.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SettingsService {
    private settingsEndpoint = '/api/settings'; // Adjust endpoint as needed

    constructor(private http: HttpClient) {}

    getSettings(): Observable<Settings> {
        return this.http.get<Settings>(this.settingsEndpoint);
    }

    updateSettings(settings: Settings): void {
        this.http.post<Settings>(this.settingsEndpoint, settings);
    }
}
