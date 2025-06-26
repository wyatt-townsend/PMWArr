import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { SettingsPage } from './pages/settings/settings.page';

export const routes: Routes = [
    { path: '', component: HomePage },
    { path: 'settings', component: SettingsPage },
];
