import { Component, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MapComponent } from '../map/map.component'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { SetShowBuildings } from '../service'
import { DragScrollComponent, DragScrollItemDirective } from 'ngx-drag-scroll'

import { Lobby } from '../http.service'
import { interval } from 'rxjs'
import { MatButtonModule } from '@angular/material/button'

@Component({
    selector: 'app-user-interface',
    standalone: true,
    imports: [CommonModule, MapComponent, MatSlideToggleModule, DragScrollComponent, DragScrollItemDirective, MatButtonModule],
    templateUrl: './user-interface.component.html',
    styleUrl: './user-interface.component.scss',
    providers: [SetShowBuildings, Lobby]
})
export class UserInterfaceComponent implements OnInit {
    constructor(private setShowBuildings: SetShowBuildings, private lobby: Lobby) { }

    @ViewChild('carousel', { read: DragScrollComponent }) ds!: DragScrollComponent


    resources: { [resource: string]: number } = { Money: 0, Stone: 0, Wood: 0, Metal: 0, Food: 0, Electricity: 0, Oil: 0, People: 0, Weapons: 0 }

    information: { [info: string]: string | number } = { Weather: 'Sunny', Date: '2021-01-01', Round: 1, Level: 1 }

    showDropdown: boolean = false
    showMenu: boolean = false
    showBuildings: boolean = true

    player2Active: boolean = false 

    testPlayerSizing() {
        this.player2Active = !this.player2Active
    }


    ngOnInit() {
        interval(30000).subscribe(() => {
            this.lobby.getLobby()
        })
        this.setShowBuildings.showBuildings$.subscribe(show => {
            this.showBuildings = show
        })
    }

    carouselLeft(): void {
        this.ds.moveLeft()
    }

    carouselRight(): void {
        this.ds.moveRight()
    }

    onClickPutLobby() {
        const data: { [resource: string]: number } = this.resources
        this.lobby.putLobby(data).subscribe((data) => {
            console.log(data)
        })
    }
}
