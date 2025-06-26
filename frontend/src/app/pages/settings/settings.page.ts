import { Component } from '@angular/core';
import { SettingsComponent } from 'app/components/settings/settings.component';

@Component({
    selector: 'settings-page',
    imports: [SettingsComponent],
    templateUrl: './settings.page.html',
    styleUrl: './settings.page.css',
})
export class SettingsPage {}
