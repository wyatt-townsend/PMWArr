import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VodItemComponent } from './vod-item.component';

describe('VodItem', () => {
    let component: VodItemComponent;
    let fixture: ComponentFixture<VodItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VodItemComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VodItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
