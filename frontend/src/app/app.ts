import { Component } from '@angular/core';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Calendar } from './calendar/calendar';

@Component({
    selector: 'app-root',
    imports: [Header, Footer, Calendar],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    protected title = 'frontend';
}
