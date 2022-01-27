import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ExtendedFeatureCollection, map } from 'd3';
import { ColorScheme } from './components/geojson-svg-map/geojson-svg-map.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  topojson$ = this.http.get('/assets/sichuan.topojson');
  geojson$ = this.http.get<ExtendedFeatureCollection>('/assets/sichuan.geojson');

  schemes: ColorScheme[] = [
    'OrRd',
    'PuBu',
    'BuPu',
    'Oranges',
    'BuGn',
    'YlOrBr',
    'YlGn',
    'Reds',
    'RdPu',
    'Greens',
    'YlGnBu',
    'Purples',
    'GnBu',
    'Greys',
    'YlOrRd',
    'PuRd',
    'Blues',
    'PuBuGn',
    'RdYlGn',
    'RdBu',
    'PiYG',
    'PRGn',
    'RdYlBu',
    'BrBG',
    'RdGy',
    'PuOr',
    'Set2',
    'Accent',
    'Set1',
    'Set3',
    'Dark2',
    'Paired',
    'Pastel2',
    'Pastel1'
  ];
  selectScheme: ColorScheme = 'Purples';
  view: 'map'|'list' = 'map';

  constructor(
    private readonly http: HttpClient
  ) {}

  ngOnInit(): void {

  }

  handleSchemeClick(scheme: ColorScheme): void {
    this.selectScheme = scheme;
  }

  setView(val: 'map'|'list'): void {
    this.view = val;
  }
}
