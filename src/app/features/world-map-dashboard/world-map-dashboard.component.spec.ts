import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldMapDashboardComponent } from './world-map-dashboard.component';

describe('WorldMapDashboardComponent', () => {
  let component: WorldMapDashboardComponent;
  let fixture: ComponentFixture<WorldMapDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldMapDashboardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WorldMapDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
