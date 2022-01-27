import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ElementRef, AfterViewInit, Renderer2, OnChanges, SimpleChanges, NgZone } from '@angular/core';
import {
  create,
  ExtendedFeature,
  ExtendedFeatureCollection,
  geoMercator,
  GeoPath,
  geoPath,
  GeoProjection,
  scaleQuantile,
  zoomIdentity,
} from 'd3';
import * as chroma from 'chroma-js';
import { ColorScheme } from './geojson-svg-map.model';

@Component({
  selector: 'geojson-svg-map',
  template: ``,
  styleUrls: ['./geojson-svg-map.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.overflow]': `'hidden'`,
    '[style.display]': `'block'`,
    '[style.width]': `visWidth`,
    '[style.height]': `visHeight`
  }
})
export class GeojsonSvgMapComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() visWidth: number | string = '100%';
  @Input() visHeight: number | string = '100%';
  @Input() visRegions: ExtendedFeature[] = [];
  @Input() visColorScaleDomain?: string | number[];
  @Input() visColorScheme: ColorScheme | string[] = 'Blues';
  @Input() visColorScaleMode: chroma.InterpolationMode = 'lch';
  @Input() visView: 'map'|'list' = 'map';

  private geojson: ExtendedFeatureCollection = {
    features: this.visRegions,
    type: 'FeatureCollection'
  };

  positions = [];
  projection?: GeoProjection;
  path?: GeoPath;
  svg = create('svg');

  selectRegion: string|null = null;

  constructor(
    private readonly ngZone: NgZone,
    private readonly renderer: Renderer2,
    private readonly elementRef: ElementRef<HTMLDivElement>
  ) {
    this.renderer.listen(window, 'resize', () => this.handleResize());
  }

  ngOnInit(): void {
    this.updateSize();
    // append svg to root container
    this.elementRef.nativeElement.appendChild(this.svg.node() as Node);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visRegions']) {
      this.geojson = {
        type: 'FeatureCollection',
        features: this.visRegions
      };
    }
    if (changes['visRegions'] || changes['visColorScheme'] || changes['vsiColorScaleMode']) {
      this.updateRegionFill();
    }
    if (changes['visView']) {
      if (changes['visView'].currentValue === 'map') {
        this.toMapView();
      } else if (changes['visView'].currentValue === 'list') {
        this.toListView();
      }
    }
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {

      this.updateSize();
      const container = this.elementRef.nativeElement;
      const width = container.offsetWidth || container.clientWidth;
      const height = container.offsetHeight || container.clientHeight;

      this.projection = geoMercator()
        .scale(0)
        .fitSize([width, height], this.geojson);
      this.path = geoPath(this.projection);

      this.svg.selectAll('g path')
        .data(this.geojson.features)
        .enter()
        .append("g")
        .attr("class", "g_regions")
        .append("path")
        .attr("d", this.path as any)
        .attr("class", "regions")
        .attr('id', (feature: ExtendedFeature) => {
          const props = feature.properties;
          const region_id = props ? props['region_id'] : null;
          return `region_${region_id}`;
        })
        .attr('opacity', (region: ExtendedFeature) => this.getOpacity(region))
        .attr('stroke', '#fff')
        .attr("stroke-width", .75)
        .style("cursor", "pointer")
        .on('click', (...args) => {
          const feature = args[1] as ExtendedFeature;
          const props = feature.properties;
          const region_id = props ? props['region_id'] : null;
          if (this.selectRegion === region_id) {
            this.updateSelectRegion(null);
            this.zoomOut();
          } else {
            this.updateSelectRegion(region_id);
            this.visView === 'map' && this.zoomIn(feature);
          }
          (args[0] as PointerEvent).stopPropagation();
        });

      if (this.visView === 'list') {
        this.toListView();
      } else if (this.visView === 'map') {
        this.toMapView();
      }

      this.svg
        .on('click', () => {
          if (this.visView === 'map') {
            this.updateSelectRegion(null);
            this.zoomOut();
          }
        }, false);
    });

  }

  toListView(): void {
    this.zoomOut();
    this.updateRegionFill();
    this.svg
      .selectAll("path")
      .transition()
      .duration(1000)
      .attr("transform", (...args) => this.getTransformation(args[0] as ExtendedFeature, args[1]))
      .attr("stroke-width", 0.25)
      .end()
      .then(() => {
        // this.addLabels();
      });
  }

  toMapView(): void {
    const selectRegion = this.visRegions.find(r => r.properties ? r.properties['region_id'] === this.selectRegion : false);
    if (selectRegion) {
      this.zoomIn(selectRegion);
    }

    this.svg
      .selectAll("path")
      .transition()
      .duration(1000)
      .attr("stroke-width", 0.75)
      .attr("transform", "translate(0,0) scale(1)")
      .end();
    this.updateRegionFill();
  }

  updateSelectRegion(selected: string|null): void {
    this.selectRegion = selected;
    this.svg
      .selectAll("path")
      .transition()
      .attr("opacity", ((region: ExtendedFeature) => this.getOpacity(region)) as any)
      .end();
  }

  updateRegionFill(): void {
    const domain = this.getColorScaleDomain(this.visRegions);
    const colorRange = chroma.scale(this.visColorScheme as string[]).mode(this.visColorScaleMode).colors(8);
    const colorScale = scaleQuantile(colorRange).domain(domain);

    this.svg
      .selectAll('path')
      .attr('fill', (...args) => {
        if (this.visView === 'map') {
          const region = args[0] as ExtendedFeature;
          const props = region.properties;
          const value = props ? props['area'] : 0;
          return value === 0 ? '#e6e6e6' : colorScale(value);
        } else {
          return colorScale(Infinity);
        }
      });
  }

  getTransformation(region: ExtendedFeature, index: number): string {
    const scale = this.getScale(region);
    const centroid = this.path!.centroid(region);
    const width = parseFloat(this.svg.attr('width')) - 204;
    const height = parseFloat(this.svg.attr('height'));
    const regionCount = this.visRegions.length;
    const columnCount = 4;
    const columnWidth = width / columnCount;
    const rowCount = regionCount % columnCount > 0
      ? regionCount / columnCount + 1
      : regionCount / columnCount;
    const rowHeight = height / rowCount;
    const positions = {
      x: columnWidth * (index % columnCount) + columnWidth / 2 + 204,
      y: rowHeight * parseInt(`${index / columnCount}`) + rowHeight / 2
    };
    const x = positions.x - centroid[0] * scale;
    const y = positions.y - centroid[1] * scale;

    return `translate(${x}, ${y}) scale(${scale})`;
  }

  getScale(region: ExtendedFeature) {
    const box = this.path!.bounds(region);
    const height = box[1][1] - box[0][1];
    const width = box[1][0] - box[0][0];
    const scale = 50 / height;
    if (scale > 2) {
      return 50 / width;
    }
    return scale;
  }

  getOpacity(region: ExtendedFeature): number {
    const props = region.properties;
    const region_id = props ? props['region_id'] : null;
    return this.selectRegion === null || this.selectRegion === region_id ? 1 : 0.2;
  }

  zoomIn(feature: ExtendedFeature): void {
    const width = parseFloat(this.svg!.attr('width'));
    const height = parseFloat(this.svg!.attr('height'));

    const [[x0, y0], [x1, y1]] = this.path!.bounds(feature);
    const x = (x0 + x1) / 2;
    const y = (y0 + y1) / 2;

    const { k } = zoomIdentity.scale(Math.min(2.5, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)));

    const translate = [
      this.scaledTransaltion(width, k, x),
      this.scaledTransaltion(height, k, y)
    ];

    this.svg
        .transition()
        .duration(750)
        .style("stroke-width", 0.75 / k)
        .attr("transform", "translate(" + translate + ") scale(" + k + ")")
        .end();
  }

  zoomOut(): void {
    this.svg!
      .transition()
      .duration(750)
      .style("stroke-width", 0.75)
      .attr("transform", "")
      .end();
  }

  scaledTransaltion(max: number, scale: number, point: number): number {
    return max * scale / 2 - point * scale;
  }

  private handleResize(): void {
    this.updateSize();
  }

  private updateSize(): void {
    const container = this.elementRef.nativeElement;
    const width = container.offsetWidth || container.clientWidth;
    const height = container.offsetHeight || container.clientHeight;
    this.svg.attr('width', width).attr('height', height);
  }

  private getColorScaleDomain(regions: ExtendedFeature[]): number[] {
    if (Array.isArray(this.visColorScaleDomain)) {
      return this.visColorScaleDomain;
    } else if (typeof this.visColorScaleDomain === 'string') {
      return regions.map((region) => region.properties ? region.properties[this.visColorScaleDomain as string] : 0);
    } else {
      return [0, 1];
    }
  }

}
