import { Component, inject, signal, OnInit, OnDestroy, Input } from '@angular/core';
import { VodService } from '../../services/vod/vod.service';
import { VodItemComponent } from '../vod-item/vod-item.component';
import { Vod } from '@shared/vod.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'vod-list-component',
    imports: [VodItemComponent],
    templateUrl: './vod-list.component.html',
    styleUrl: './vod-list.component.css',
})
export class VodListComponent implements OnInit, OnDestroy {
    @Input() selectedDate?: Date;
    vodInfo = signal<Vod[]>([]);
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

    get filteredVodInfo() {
        if (!this.selectedDate) return [];
        return this.vodInfo().filter((vod) => {
            const aired = vod.aired;
            return (
                aired.getUTCFullYear() === this.selectedDate.getFullYear() &&
                aired.getUTCMonth() === this.selectedDate.getMonth() &&
                aired.getUTCDate() === this.selectedDate.getDate()
            );
        });
    }
}
