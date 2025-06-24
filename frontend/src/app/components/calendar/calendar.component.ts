import { Component, inject, OnDestroy, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VodService } from '../../services/vod/vod.service';
import { Temp } from '../../temp.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './calendar.component.html',
    styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit, OnDestroy {
    @Output() dateEmitted = new EventEmitter<Date>();

    currentDate: Date = new Date();
    selectedDate: Date = new Date();
    
    vodInfo = signal<Temp[]>([]);
    vodService = inject(VodService);
    private vodsSub?: Subscription;

    ngOnInit(): void {
        this.vodsSub = this.vodService.getVods().subscribe((vods) => {
            this.vodInfo.set(vods);
        });
    }

    ngOnDestroy(): void {
        this.vodsSub?.unsubscribe();
    }

    get month(): number {
        return this.currentDate.getMonth();
    }

    get year(): number {
        return this.currentDate.getFullYear();
    }

    get monthName(): string {
        return this.currentDate.toLocaleString('default', { month: 'long' });
    }

    get daysInMonth(): number {
        return new Date(this.year, this.month + 1, 0).getDate();
    }

    get firstDayOfWeek(): number {
        return new Date(this.year, this.month, 1).getDay();
    }

    get weeks(): (Date | null)[][] {
        const days: (Date | null)[] = [];
        for (let i = 0; i < this.firstDayOfWeek; i++) {
            days.push(null);
        }
        for (let d = 1; d <= this.daysInMonth; d++) {
            days.push(new Date(this.year, this.month, d));
        }
        while (days.length % 7 !== 0) {
            days.push(null);
        }
        const weeks: (Date | null)[][] = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }
        return weeks;
    }

    today() {
        this.currentDate = new Date();
        this.selectDate(this.currentDate);
    }

    prevMonth() {
        this.currentDate = new Date(this.year, this.month - 1, 1);
    }

    nextMonth() {
        this.currentDate = new Date(this.year, this.month + 1, 1);
    }

    selectDate(date: Date | null) {
        if (date) {
            this.selectedDate = date;
        }

        this.dateEmitted.emit(this.selectedDate);
    }

    hasVodOnDate(date: Date | null): boolean {
        if (!date) return false;
        return this.vodInfo().some(vod => 
            vod.aired.toDateString() === date.toDateString()
        );
    }
}
