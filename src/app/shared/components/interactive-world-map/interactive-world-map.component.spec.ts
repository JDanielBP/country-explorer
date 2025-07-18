import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveWorldMapComponent } from './interactive-world-map.component';

describe('InteractiveWorldMapComponent', () => {
  let component: InteractiveWorldMapComponent;
  let fixture: ComponentFixture<InteractiveWorldMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractiveWorldMapComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InteractiveWorldMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
