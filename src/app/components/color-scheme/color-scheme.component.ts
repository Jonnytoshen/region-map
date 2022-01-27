import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnChanges, SimpleChanges, Input } from '@angular/core';
import * as chroma from 'chroma-js';
import { ColorScheme } from '../geojson-svg-map/geojson-svg-map.model';

@Component({
  selector: 'color-scheme',
  templateUrl: './color-scheme.component.html',
  styleUrls: ['./color-scheme.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.display]': `'block'`,
    '[style.height]': `'16px'`,
    '[style.background]': `background`
  }
})
export class ColorSchemeComponent implements OnInit, OnChanges {

  @Input() ngScheme: ColorScheme = 'Accent';

  background?: string;

  constructor() { }

  ngOnInit(): void {
    this.updateBackground();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ngScheme']) {
      this.updateBackground();
    }
  }

  private updateBackground(): void {
    const colors = chroma.scale(this.ngScheme).colors(8);
    const ratio = 1 / colors.length;
    const str = colors.map((color, index) => {
      return `${color} ${index * ratio * 100}%, ${color} ${(index + 1) * ratio * 100}%`;
    }).join(', ');
    this.background = `linear-gradient(90deg, ${str})`;
  }

}
