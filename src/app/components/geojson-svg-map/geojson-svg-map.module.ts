import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeojsonSvgMapComponent } from './geojson-svg-map.component';



@NgModule({
  declarations: [
    GeojsonSvgMapComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    GeojsonSvgMapComponent
  ]
})
export class GeojsonSvgMapModule { }
