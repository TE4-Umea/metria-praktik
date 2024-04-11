/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import { fromLonLat } from 'ol/proj'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Fill, Stroke, Style } from 'ol/style.js'
import GeoJSON from 'ol/format/GeoJSON'
import { Decoder, GetCookie, SetLan, SetShowBuildings, SetShowEnemies } from '../service'
import { LanChoose } from '../user-interface/user-interface.component'
import { MatDialogRef } from '@angular/material/dialog'
import { Lobby } from '../http.service'
@Component({
    selector: 'app-map',
    standalone: true,
    imports: [],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
    providers: [LanChoose, { provide: MatDialogRef, useValue: {} }]
})
export class MapComponent implements OnInit, OnDestroy {
    constructor(private setShowBuildings: SetShowBuildings, private setShowEenemies: SetShowEnemies, private decoder: Decoder, private getCookie: GetCookie, private lobby: Lobby, private setLan: SetLan) { }

    @ViewChild('mapElement', { static: true }) mapElement: ElementRef | undefined

    selectedLan: string = ''
    playerLan: string[] = []
    enemyLan: string[] = []
    round: number = 0

    ngOnInit(): void {
        this.getLobbyData()
    }

    ngOnDestroy(): void {
        this.map?.setTarget(undefined)
    }

    getLobbyData() {
        const username = this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username
        this.lobby.getLobby().subscribe((data) => {
            if (data.data.round) {
                this.round = data.data.round
            }
            this.initMap()
            if (data.data.areas) {
                data.data.areas.forEach((element: any) => {
                    if (Array.isArray(element)) {
                        element.forEach((subElement: any) => {
                            if (subElement.owner === username) {
                                this.playerLan.push(subElement.lan)
                            } else if (subElement.owner !== username) {
                                this.enemyLan.push(subElement.lan)
                            }
                        })
                    }
                })
            }
        })
    }

    private initMap(): void {
        this.mapLayer = new VectorLayer({
            source: new VectorSource({
                url: 'assets/sweden.json',
                format: new GeoJSON()
            }),
            style: this.round >= 1 ? this.vectorStylePlaying.bind(this) : this.vectorStyleStarting.bind(this)
        })

        this.map = new Map({
            target: this.mapElement?.nativeElement,
            layers: [
                new TileLayer({
                    source: new OSM()
                }),
                this.mapLayer

            ],
            view: new View({
                center: fromLonLat([17.242829157757257, 63.82811461193097]),
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
    mapLayer: any

    private handleMapClick(event: any): void {
        this.setShowBuildings.setShowBuildings(false)
        this.setShowEenemies.setShowEnemies(false)
        this.selectedLan = ''
        this.mapLayer.getSource().changed()
        this.map?.forEachFeatureAtPixel(event.pixel, (feature) => {
            if (this.round === 0) {
                this.setShowBuildings.setShowBuildings(true)
            } else if (this.round >= 1 && this.playerLan.includes(feature.get('name'))) {
                this.setShowBuildings.setShowBuildings(true)
            } else if (this.round >= 1 && !this.playerLan.includes(feature.get('name'))) {
                this.setShowEenemies.setShowEnemies(true)
            }
            this.setLan.setLan(feature.get('name'))
            this.selectedLan = feature.get('name')
            this.mapLayer.getSource().changed()
        })
    }


    vectorStylePlaying(feature: any) {
        const selectedStyle = new Style({
            fill: new Fill({
                color: 'rgba(25, 25, 25, 0.5)',
            }),
            stroke: new Stroke({
                color: 'rgba(0, 106, 167, 0.7)',
                width: 2,
            }),
        })
        const enemySelectedStyle = new Style({
            fill: new Fill({
                color: 'rgba(255, 0, 0, 0.5)',
            }),
            stroke: new Stroke({
                color: 'rgba(0, 106, 167, 0.7)',
                width: 2,
            }),
        })
        const playerSelectedStyle = new Style({
            fill: new Fill({
                color: 'rgba(100, 255, 100, 0.6)',
            }),
            stroke: new Stroke({
                color: 'rgba(0, 106, 167, 0.7)',
                width: 2,
            }),
        })
        const playerStyle = new Style({
            fill: new Fill({
                color: 'rgba(100, 255, 100, 0.3)',
            }),
            stroke: new Stroke({
                color: 'rgba(0, 255, 0, 0.7)',
                width: 2,
            }),
        })
        if (this.selectedLan === feature.get('name')) {
            if (this.playerLan.includes(this.selectedLan)) {
                return playerSelectedStyle
            } else if (this.enemyLan.includes(this.selectedLan)) {
                return enemySelectedStyle
            } else {
                return selectedStyle
            }
        } else if (this.selectedLan === '') {
            if (this.playerLan.includes(feature.get('name'))) {
                return playerStyle
            } else {
                return this.defaultGamingStyle(feature)
            }
        } else {
            return this.defaultGamingStyle(feature)
        }
    }

    defaultGamingStyle(feature: any) {
        const defaultStyle = new Style({
            fill: new Fill({
                color: 'rgba(25, 25, 25, 0.3)'
            }),
            stroke: new Stroke({
                color: '#319FD3',
                width: 1
            })
        })
        const playerStyle = new Style({
            fill: new Fill({
                color: 'rgba(100, 255, 100, 0.3)',
            }),
            stroke: new Stroke({
                color: 'rgba(0, 255, 0, 0.7)',
                width: 2,
            }),
        })
        const enemyStyle = new Style({
            fill: new Fill({
                color: 'rgba(255, 0, 0, 0.3)'
            }),
            stroke: new Stroke({
                color: '#319FD3',
                width: 1
            })
        })
        if (this.playerLan.includes(feature.get('name'))) {
            return playerStyle
        } else if (this.enemyLan.includes(feature.get('name'))) {
            return enemyStyle
        } else {
            return defaultStyle
        }
    }

    vectorStyleStarting(feature: any) {
        const defaultStyle = new Style({
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.6)'
            }),
            stroke: new Stroke({
                color: '#319FD3',
                width: 1
            })
        })
        const selectedStyle = new Style({
            fill: new Fill({
                color: 'rgba(0, 106, 167, 0.3)',
            }),
            stroke: new Stroke({
                color: 'rgba(0, 106, 167, 0.7)',
                width: 2,
            }),
        })
        if (this.selectedLan === feature.get('name')) {
            return selectedStyle
        } else if (this.selectedLan === '') {
            return defaultStyle
        } else {
            return defaultStyle
        }
    }

}



