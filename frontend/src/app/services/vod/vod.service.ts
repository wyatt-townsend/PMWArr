import { Injectable, inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vod } from '@shared/vod.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, NotificationTopic } from '@shared/notification.model';

@Injectable({
    providedIn: 'root',
})
export class VodService implements OnDestroy {
    // Store VOD entities in a BehaviorSubject for reactive access
    private vodsSubject = new BehaviorSubject<Vod[]>([]);
    private vodEndpoint = '/api/vods'; // Adjust endpoint as needed
    private jobEndpoint = '/api/job'; // Adjust endpoint as needed

    // Notifications
    notificationService = inject(NotificationService);
    notificationSubscription: Subscription;

    constructor(private http: HttpClient) {
        this.fetchVods();
        this.notificationSubscription = this.notificationService.getNotificationObservable().subscribe({
            next: (notification) => {
                if (
                    notification.message.type !== NotificationType.ERROR &&
                    (notification.topic === NotificationTopic.DOWNLOAD || notification.topic === NotificationTopic.SYNC)
                ) {
                    this.fetchVods();
                    console.log('VODs updated after notification:', notification.message);
                }
            },
        });
    }

    ngOnDestroy(): void {
        if (this.notificationSubscription) {
            this.notificationSubscription.unsubscribe();
        }
    }

    // Fetch all VOD entities from the backend and update the subject
    fetchVods(): void {
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
        this.http.post<void>(this.jobEndpoint + '/download/' + vod.id, null).subscribe({
            next: () => {
                console.log('VOD download request successful');
            },
            error: (error) => {
                console.error('VOD download request failed:', error);
            },
        });
    }

    sync(date: Date): void {
        this.http
            .post<Vod[]>(this.jobEndpoint + '/sync/', null, {
                params: new HttpParams({
                    fromObject: {
                        date: date.toISOString().slice(0, 10), // Format date as YYYY-MM-DD
                    },
                }),
            })
            .subscribe({
                next: (response) => {
                    console.log('Vod sync request successful:', response);
                    this.fetchVods();
                },
                error: (error) => {
                    console.error('Vod sync request failed:', error);
                },
            });
    }
}
