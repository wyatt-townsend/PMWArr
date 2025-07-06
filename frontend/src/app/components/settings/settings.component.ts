import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsService } from 'app/services/settings/settings.service';
import { NotificationService } from 'app/services/notification/notification.service';
import { NotificationTopic, NotificationType } from '@shared/notification.model';
import Settings from '@shared/settings.model';
import { Subscription } from 'rxjs';

interface ISettingsFormGroup {
    auto_download: FormControl<boolean>;
    sync_days: FormControl<string>;
    sync_hour: FormControl<number>;
}

@Component({
    selector: 'settings-component',
    imports: [ReactiveFormsModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit, OnDestroy {
    form: FormGroup<ISettingsFormGroup>;
    settings = signal<Settings>(null);
    private router = inject(Router);
    private settingsService = inject(SettingsService);
    private notificationService = inject(NotificationService);
    private settingsSub?: Subscription;

    readonly syncDayOptions = [
        { value: '-1', label: 'Daily' },
        { value: '0', label: 'Sunday' },
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday' },
        { value: '5', label: 'Friday' },
        { value: '6', label: 'Saturday' },
    ];

    ngOnInit(): void {
        this.form = new FormGroup<ISettingsFormGroup>({
            auto_download: new FormControl<boolean>(false),
            sync_days: new FormControl<string>('-1'),
            sync_hour: new FormControl<number>(0),
        });

        this.settingsSub = this.settingsService.getSettings().subscribe((settings) => {
            this.settings.set(settings);
            if (settings) {
                this.form.setValue({
                    auto_download: settings.auto_download,
                    sync_days: settings.sync_day.toString(),
                    sync_hour: settings.sync_hour,
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.settingsSub?.unsubscribe();
    }

    saveSettings() {
        console.log('Saving settings:', this.form.value);
        if (this.form.valid) {
            const updatedSettings: Settings = {
                ...this.settings(),
                auto_download: this.form.value.auto_download,
                sync_day: parseInt(this.form.value.sync_days, 10),
                sync_hour: this.form.value.sync_hour,
            };

            this.settingsService.updateSettings(updatedSettings).subscribe({
                next: (response) => {
                    console.log('Settings saved successfully:', response);
                    this.notificationService.notify({
                        topic: NotificationTopic.SETTINGS,
                        message: {
                            type: NotificationType.SUCCESS,
                            message: 'Settings updated successfully',
                        },
                    });
                    this.router.navigate(['/']);
                },
                error: (error) => {
                    console.error('Error saving settings:', error);
                    this.notificationService.notify({
                        topic: NotificationTopic.SETTINGS,
                        message: {
                            type: NotificationType.ERROR,
                            message: `Failed to update settings: ${error.message}`,
                        },
                    });
                },
            });
        }
    }
}
