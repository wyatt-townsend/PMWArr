import { Component, inject, signal, OnInit, OnDestroy, Input } from '@angular/core';
import { VodService } from '../../services/vod/vod.service';
import { VodItemComponent } from '../vod-item/vod-item.component';
import { Temp } from '../../temp.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vod-list',
  imports: [VodItemComponent],
  templateUrl: './vod-list.component.html',
  styleUrl: './vod-list.component.css'
})
export class VodListComponent implements OnInit, OnDestroy {
  @Input() selectedDate?: Date;
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

  get filteredVodInfo() {
    if (!this.selectedDate) return [];
    return this.vodInfo().filter(
      vod => vod.aired.toDateString() === this.selectedDate?.toDateString()
    );
  }
}
