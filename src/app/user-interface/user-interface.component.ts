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
import { HttpClientModule } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatDialogRef, MatDialog } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'

@Component({
    selector: 'app-user-interface',
    standalone: true,
    imports: [CommonModule, MapComponent, MatSlideToggleModule, DragScrollComponent, DragScrollItemDirective, MatButtonModule],
    templateUrl: './user-interface.component.html',
    styleUrl: './user-interface.component.scss'

})
export class UserInterfaceComponent implements OnInit {
    constructor(public dialog: MatDialog, private setShowBuildings: SetShowBuildings, public router: Router, private decoder: Decoder, private getCookie: GetCookie, private lobby: Lobby) { }

    @ViewChild('carousel', { read: DragScrollComponent }) ds!: DragScrollComponent


    resources: { [resource: string]: number } = { Money: 0, BuildingMaterials: 0, Army: 0 }

    information: { [info: string]: string | number } = { Weather: 'Sunny', Date: '2021-01-01', Round: 1, Level: 1 }

    showDropdown: boolean = false
    showMenu: boolean = false
    showBuildings: boolean = true

    playerName: string = ''
    enemyPlayerNames: string[] = []

    lobbyOwnerChosen: boolean = false
    lanChosen: boolean = false

    player2Active: boolean = false

    testPlayerSizing() {
        this.player2Active = !this.player2Active
    }


    ngOnInit() {
        this.getLobbyNames()
        this.getLobbyData()
        this.toggleBuildings('250ms', '250ms')
        interval(10000).subscribe(() => {
            this.getLobbyData()
        })
    }




    toggleBuildings(enterAnimationDuration: string, exitAnimationDuration: string): void {
        this.setShowBuildings.showBuildings$.subscribe(show => {
            this.showBuildings = show
            if (this.showBuildings === true) {
                this.dialog.open(LanChoose, {
                    width: '380px',
                    enterAnimationDuration,
                    exitAnimationDuration,
                })
            }
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

    checkLanChoose(enterAnimationDuration: string, exitAnimationDuration: string): void {
        this.lobby.getLobby().subscribe((data: any) => {
            if (this.lanChosen === true && this.lobbyOwnerChosen === true && this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username === data.lobbyOwner) {
                this.dialog.open(StartGame, {
                    width: '380px',
                    enterAnimationDuration,
                    exitAnimationDuration,
                })
            }
            data.players.forEach((element: any) => {
                if (element.status === 'chosen') {
                    this.lanChosen = true
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

@Component({
    selector: 'lan-choose',
    templateUrl: 'lan-choose.html',
    styleUrl: '../starting-screen/starting-screen.component.scss',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule],
    providers: []
})
export class LanChoose {
    constructor(public dialogRef: MatDialogRef<LanChoose>, private lobby: Lobby, private decoder: Decoder, private getCookie: GetCookie) { }

    chosenLan() {
        this.lobby.putLobbyPlayers([{ status: 'chosen', username: this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username }])
    }

}

@Component({
    selector: 'start-game',
    templateUrl: 'start-game.html',
    styleUrl: '../starting-screen/starting-screen.component.scss',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule],
    providers: []
})
export class StartGame {
    constructor(public dialogRef: MatDialogRef<StartGame>, private lobby: Lobby, private decoder: Decoder, private getCookie: GetCookie) { }

    startGame() {
    }

}