import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VodListComponent } from './vod-list.component';

describe('VodList', () => {
  let component: VodListComponent;
  let fixture: ComponentFixture<VodListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VodListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VodListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
