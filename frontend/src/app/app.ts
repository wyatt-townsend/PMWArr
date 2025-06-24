import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { VodListComponent } from './components/vod-list/vod-list.component';

@Component({
    selector: 'app-root',
    imports: [HeaderComponent, FooterComponent, CalendarComponent, VodListComponent],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    protected title = 'frontend';
    selectedDate?: Date;

    onDateSelected(date: Date): void {
        this.selectedDate = date;
    }
}
