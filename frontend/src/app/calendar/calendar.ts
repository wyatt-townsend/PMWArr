import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './calendar.html',
    styleUrl: './calendar.css',
})
export class Calendar {
    currentDate: Date = new Date();
    selectedDate: Date = new Date();

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
        this.selectedDate = new Date();
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
    }
}
