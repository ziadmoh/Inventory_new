import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarCountriesComponent } from './car-countries.component';

describe('CarCountriesComponent', () => {
  let component: CarCountriesComponent;
  let fixture: ComponentFixture<CarCountriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarCountriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarCountriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
