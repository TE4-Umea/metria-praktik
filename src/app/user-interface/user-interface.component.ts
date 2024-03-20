/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MapComponent } from '../map/map.component'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { Decoder, GetCookie, SetShowBuildings } from '../service'
import { DragScrollComponent, DragScrollItemDirective } from 'ngx-drag-scroll'

import { Lobby } from '../http.service'
import { interval } from 'rxjs'
import { MatButtonModule } from '@angular/material/button'
import { Router } from '@angular/router'

@Component({
    selector: 'app-user-interface',
    standalone: true,
    imports: [CommonModule, MapComponent, MatSlideToggleModule, DragScrollComponent, DragScrollItemDirective, MatButtonModule],
    templateUrl: './user-interface.component.html',
    styleUrl: './user-interface.component.scss'
})
export class UserInterfaceComponent implements OnInit {
    constructor(private setShowBuildings: SetShowBuildings, public router: Router, private decoder: Decoder, private getCookie: GetCookie, private lobby: Lobby) { }

    @ViewChild('carousel', { read: DragScrollComponent }) ds!: DragScrollComponent


    resources: { [resource: string]: number } = { Money: 0, BuildingMaterials: 0, Army: 0 }

    information: { [info: string]: string | number } = { Weather: 'Sunny', Date: '2021-01-01', Round: 1, Level: 1 }

    showDropdown: boolean = false
    showMenu: boolean = false
    showBuildings: boolean = true

    playerName: string = ''
    enemyPlayerNames: string[] = []

    player2Active: boolean = false

    testPlayerSizing() {
        this.player2Active = !this.player2Active
    }


    ngOnInit() {
        this.getLobbyNames()
        this.getLobbyData()
        this.toggleBuildings()
        interval(10000).subscribe(() => {
            this.getLobbyData()
        })
    }


    toggleBuildings(): void {
        this.setShowBuildings.showBuildings$.subscribe(show => {
            this.showBuildings = show
        })
    }

    getLobbyData() {
        this.lobby.getLobby().subscribe(() => {

        })
    }

    getLobbyNames() {
        this.playerName = this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username
        this.lobby.getLobby().subscribe((data: any) => {
            if (data.lobbyOwner !== this.playerName) {
                this.enemyPlayerNames.push(data.lobbyOwner)
            }
            data.players.forEach((element: any) => {
                if (element.username !== this.playerName) {
                    this.enemyPlayerNames.push(element.username)
                }
            })
        })
    }


    onClickPutLobbyData() {
        const data: { [resource: string]: number } = this.resources
        this.lobby.putLobbyData(data)
    }


    carouselLeft(): void {
        this.ds.moveLeft()
    }

    carouselRight(): void {
        this.ds.moveRight()
    }

}
