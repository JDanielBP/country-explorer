import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCountryComponent } from './view-country.component';

describe('ViewCountryComponent', () => {
  let component: ViewCountryComponent;
  let fixture: ComponentFixture<ViewCountryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCountryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewCountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
