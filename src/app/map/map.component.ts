import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import { fromLonLat } from 'ol/proj'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Select from 'ol/interaction/Select.js'
import { Fill, Stroke, Style } from 'ol/style.js'
import GeoJSON from 'ol/format/GeoJSON'
import { click } from 'ol/events/condition'
import { SetShowBuildings, SetCurrentLan } from '../service'
import { LanChoose } from '../user-interface/user-interface.component'
import { MatDialogRef } from '@angular/material/dialog'
@Component({
    selector: 'app-map',
    standalone: true,
    imports: [],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
    providers: [LanChoose, { provide: MatDialogRef, useValue: {} }]
})
export class MapComponent implements OnInit, OnDestroy {
    constructor(private setShowBuildings: SetShowBuildings, private lanChoose: LanChoose, private setCurrentLan: SetCurrentLan) { }

    @ViewChild('mapElement', { static: true }) mapElement: ElementRef | undefined

    ngOnInit(): void {
        this.initMap()
    }

    ngOnDestroy(): void {
        this.map?.setTarget(undefined)
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
                zoom: 7,
                maxZoom: 7,
                minZoom: 5,
                extent: [-2002513.341856, 7011017.966314, 6016327.095083, 11036950.728974] //West, South, East, North
            })
        })

        this.map.on('click', (event) => {
            this.handleMapClick(event)
        })
    }
    map: Map | undefined

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        const select = new Select({ condition: click, style: selectedStyle })
        this.map?.addInteraction(select)
        this.setShowBuildings.setShowBuildings(false)
        this.map?.forEachFeatureAtPixel(event.pixel, (feature) => {
            this.setShowBuildings.setShowBuildings(true)
            console.log(feature.get('name'))
            const lan: String = feature.get('name')
            this.setCurrentLan.setCurrentLan(lan)
        })
    }
}



