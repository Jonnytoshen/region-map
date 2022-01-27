import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ExtendedFeatureCollection } from 'd3';
import { ColorScheme } from './components/geojson-svg-map/geojson-svg-map.model';

import * as geojson from '../assets/sichuan.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  geojson = geojson as ExtendedFeatureCollection;

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

  constructor() {}

  ngOnInit(): void {

  }

  handleSchemeClick(scheme: ColorScheme): void {
    this.selectScheme = scheme;
  }

  setView(val: 'map'|'list'): void {
    this.view = val;
  }
}
