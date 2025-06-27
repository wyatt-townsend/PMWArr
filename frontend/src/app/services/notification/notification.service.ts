import { Injectable, OnDestroy } from '@angular/core';
import { NotificationMessage, NotificationTopic } from '@shared/notification.model';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export type Notification = {
    topic: NotificationTopic;
    message: NotificationMessage;
};

@Injectable({
    providedIn: 'root',
})
export class NotificationService implements OnDestroy {
    private socket: Socket;
    private notificationSubject = new Subject<Notification>();

    constructor() {
        this.socket = io('http://localhost:3000', {
            transports: ['websocket'],
            autoConnect: true,
        });

        this.setupSocketListeners();
    }

    ngOnDestroy(): void {
        this.socket.disconnect();
        this.notificationSubject.complete();
    }

    private setupSocketListeners(): void {
        Object.values(NotificationTopic).forEach((topic) => {
            this.socket.on(topic, (message: NotificationMessage) => {
                this.notificationSubject.next({
                    topic: topic as NotificationTopic,
                    message: message,
                });
            });
        });

        this.socket.on('connect', () => {
            console.log('Connected to notification server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from notification server');
        });
    }

    public getNotificationObservable(): Observable<Notification> {
        return this.notificationSubject.asObservable();
    }
}
