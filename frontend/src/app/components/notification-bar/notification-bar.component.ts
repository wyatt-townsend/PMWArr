import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification/notification.service';
import { Subscription, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationMessage } from '@shared/notification.model';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'notification-bar-component',
    imports: [CommonModule],
    templateUrl: './notification-bar.component.html',
    styleUrl: './notification-bar.component.css',
})
export class NotificationBarComponent implements OnInit, OnDestroy {
    notificationService = inject(NotificationService);
    notificationSubscription: Subscription;
    private currentTimer$ = new Subject<void>();
    private readonly NOTIFICATION_DURATION = 5000; // 5 seconds in milliseconds
    activeNotification: NotificationMessage | null = null;

    ngOnInit(): void {
        // Subscribe to notifications
        this.notificationSubscription = this.notificationService.getNotificationObservable().subscribe({
            next: (notification) => {
                this.displayNotification(notification);
            },
        });
    }

    ngOnDestroy(): void {
        if (this.notificationSubscription) {
            this.notificationSubscription.unsubscribe();
        }
        if (this.currentTimer$) {
            this.currentTimer$.next(); // Cancel any ongoing timer
            this.currentTimer$.complete(); // Complete the subject to clean up
        }
    }

    displayNotification(notification: Notification): void {
        // Cancel any existing timer
        this.currentTimer$.next();

        // Show new notification
        this.activeNotification = notification.message;

        // Start new timer
        timer(this.NOTIFICATION_DURATION)
            .pipe(takeUntil(this.currentTimer$))
            .subscribe(() => {
                this.activeNotification = null;
            });
    }
}
