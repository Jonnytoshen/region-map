import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GeojsonSvgMapModule } from './components/geojson-svg-map';
import { ColorSchemeModule } from './components/color-scheme';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GeojsonSvgMapModule,
    ColorSchemeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
