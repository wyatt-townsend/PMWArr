import { Component, input} from '@angular/core';
import {Temp} from '../../temp.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vod-item',
  imports: [CommonModule],
  templateUrl: './vod-item.component.html',
  styleUrl: './vod-item.component.css'
})
export class VodItemComponent {
  readonly info = input.required<Temp>();
}
