import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotificationBarComponent } from './components/notification-bar/notification-bar.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [HeaderComponent, FooterComponent, NotificationBarComponent, RouterOutlet],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {}
