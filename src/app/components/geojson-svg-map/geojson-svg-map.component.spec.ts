import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeojsonSvgMapComponent } from './geojson-svg-map.component';

describe('GeojsonSvgMapComponent', () => {
  let component: GeojsonSvgMapComponent;
  let fixture: ComponentFixture<GeojsonSvgMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeojsonSvgMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeojsonSvgMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
