import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, toLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Select from 'ol/interaction/Select.js';
import { Fill, Stroke, Style } from 'ol/style.js';
import GeoJSON from 'ol/format/GeoJSON';
import { click } from 'ol/events/condition';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, OnDestroy {

  @ViewChild('mapElement', { static: true }) mapElement: ElementRef | undefined;

  map: Map | undefined;

  ngOnInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map?.setTarget(undefined);
  }

  private initMap(): void {
    this.map = new Map({
      target: this.mapElement?.nativeElement,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        new VectorLayer({
          source: new VectorSource({
            url: 'assets/sweden.json',
            format: new GeoJSON()
          })
        })
      ],
      view: new View({
        center: fromLonLat([20.242829157757257, 63.82811461193097]),
        zoom: 11
      })
    });

    this.map.on('singleclick', this.handleMapClick.bind(this))
  }

  private handleMapClick(event: any): void {
    const selectedStyle = new Style({
      fill: new Fill({
        color: 'rgba(0, 106, 167, 0.3)',
      }),
      stroke: new Stroke({
        color: 'rgba(0, 106, 167, 0.7)',
        width: 2,
      }),
    })

    const mapReference = this.map
    this.map?.on('click', function (event) {
      const select = new Select({ condition: click, style: selectedStyle })
      mapReference?.addInteraction(select)
    })

    console.log(`Zoom level: ${this.map?.getView().getZoom()}`);
    console.log(`Map coordinates (wgs84): ${toLonLat(event.coordinate)}`);
    console.log(`Pixel coordinates (top-left): ${event.pixel}`);
  }
}

