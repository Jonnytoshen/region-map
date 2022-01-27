import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorSchemeComponent } from './color-scheme.component';



@NgModule({
  declarations: [
    ColorSchemeComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ColorSchemeComponent
  ]
})
export class ColorSchemeModule { }
