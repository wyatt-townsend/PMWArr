import { Component, inject } from '@angular/core';
import { CalendarComponent } from 'app/components/calendar/calendar.component';
import { VodListComponent } from 'app/components/vod-list/vod-list.component';
import { VodService } from 'app/services/vod/vod.service';

@Component({
    selector: 'home-page',
    imports: [CalendarComponent, VodListComponent],
    templateUrl: './home.page.html',
    styleUrl: './home.page.css',
})
export class HomePage {
    selectedDate?: Date;
    vodService = inject(VodService);

    onDateSelected(date: Date): void {
        this.selectedDate = date;
    }

    onSync(): void {
        this.vodService.sync(this.selectedDate || new Date());
    }
}
