import { Component, input, inject } from '@angular/core';
import { Vod, VodState } from '@shared/vod.model';
import { VodService } from 'app/services/vod/vod.service';
import { CommonModule } from '@angular/common';
import { FileSizePipe } from 'app/pipes/file-size.pipe';

@Component({
    selector: 'vod-item-component',
    imports: [CommonModule, FileSizePipe],
    templateUrl: './vod-item.component.html',
    styleUrl: './vod-item.component.css',
})
export class VodItemComponent {
    private vodService = inject(VodService);
    readonly info = input.required<Vod>();
    VodState = VodState;
    expanded = false;

    toggleDropdown() {
        this.expanded = !this.expanded;
    }

    doDownload() {
        this.vodService.download(this.info());
        this.toggleDropdown();
    }
}
