/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { Decoder, GetCookie, LobbyOwnerChooseAndStartGame, SetShowBuildings } from '../service'
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
import buildings from '../../assets/buildings.json'

@Component({
    selector: 'app-user-interface',
    standalone: true,
    imports: [CommonModule, MatSlideToggleModule, DragScrollComponent, DragScrollItemDirective, MatButtonModule],
    templateUrl: './user-interface.component.html',
    styleUrl: './user-interface.component.scss'

})
export class UserInterfaceComponent implements OnInit {
    constructor(public dialog: MatDialog, private lobbyOwnerAndStartGame: LobbyOwnerChooseAndStartGame, private setShowBuildings: SetShowBuildings, public router: Router, private decoder: Decoder, private getCookie: GetCookie, private lobby: Lobby) { }

    @ViewChild('carousel', { read: DragScrollComponent }) ds!: DragScrollComponent


    resources: { [resource: string]: number } = { Money: 0, BuildingMaterials: 0, Army: 0 }

    information: { [info: string]: string | number } = { Weather: 'Sunny', Date: '2021-01-01', Round: 1, Level: 1 }

    showDropdown: boolean = false
    showMenu: boolean = false
    showBuildings: boolean = false

    lobbyOwner: string = ''
    playerName: string = ''
    enemyPlayerNames: string[] = []

    lobbyOwnerChosen: boolean = false
    lanChosen: boolean = false
    choosingLanScreen: boolean = true
    ifDialogOpen: boolean = false

    player2Active: boolean = false

    buildings = buildings

    ngOnInit() {
        this.getLobbyNames()
        this.toggleBuildingsAndChooseLan('450ms', '350ms')
        this.onScreenCheckLanChoice()
        console.log(buildings)
        interval(5000).subscribe(() => {
            this.onScreenCheckLanChoice()
        })
    }


    onScreenCheckLanChoice() {
        this.lobby.getLobby().subscribe((data: any) => {
            if (data.data.startGame === false || data.data.startGame === undefined) {
                console.log(this.ifDialogOpen)
                if (this.ifDialogOpen === false) {
                    this.checkLanChoose('450ms', '350ms')
                }
            }
        })
    }

    startGame(enterAnimationDuration: string, exitAnimationDuration: string): void {
        this.dialog.open(StartGame, {
            width: '380px',
            enterAnimationDuration,
            exitAnimationDuration,
        })
    }


    toggleBuildingsAndChooseLan(enterAnimationDuration: string, exitAnimationDuration: string): void {
        this.lobby.getLobby().subscribe((data: any) => {
            this.lobbyOwnerAndStartGame.lobbyOwnerChosen$.subscribe(chosen => {
                this.lobbyOwnerChosen = chosen
                this.setShowBuildings.showBuildings$.subscribe(show => {
                    if (data.data.startGame === false || data.data.startGame === undefined) {
                        if (this.lanChosen === false) {
                            if (show === true) {
                                this.dialog.open(LanChoose, {
                                    width: '380px',
                                    enterAnimationDuration,
                                    exitAnimationDuration,
                                })
                            }
                        } else if (this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username === this.lobbyOwner && this.lobbyOwnerChosen === false) {
                            if (show === true) {
                                this.dialog.open(LanChoose, {
                                    width: '380px',
                                    enterAnimationDuration,
                                    exitAnimationDuration,
                                })
                            }
                        }
                    }
                    else {
                        this.showBuildings = show
                    }
                })
            })
        })
    }

    checkLanChoose(enterAnimationDuration: string, exitAnimationDuration: string): void {
        this.lobby.getLobby().subscribe((data: any) => {
            if (this.lanChosen === true && this.lobbyOwnerChosen === true) {
                this.dialog.open(StartGame, {
                    width: '380px',
                    enterAnimationDuration,
                    exitAnimationDuration,
                })
                this.ifDialogOpen = true
            } else if (this.lanChosen === true && this.lobbyOwnerChosen === false) {
                this.dialog.open(StartGame, {
                    width: '380px',
                    enterAnimationDuration,
                    exitAnimationDuration,
                })
                this.ifDialogOpen = true
            }
            data.players.forEach((element: { status: string; username: string }) => {
                if (element.status === 'chosen') {
                    this.lanChosen = true
                }
            })
        })
    }

    getLobbyNames() {
        this.playerName = this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username
        this.lobby.getLobby().subscribe((data: any) => {
            this.lobbyOwner = data.lobbyOwner
            if (data.lobbyOwner !== this.playerName) {
                this.enemyPlayerNames.push(data.lobbyOwner)
            }
            data.players.forEach((element: { status: string; username: string }) => {
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

    testPlayerSizing() {
        this.player2Active = !this.player2Active
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
    constructor(public dialogRef: MatDialogRef<LanChoose>, private lobbyOwner: LobbyOwnerChooseAndStartGame, private lobby: Lobby, private decoder: Decoder, private getCookie: GetCookie) { }

    buttonChooseLan() {
        this.lobby.getLobby().subscribe((data: any) => {
            if (this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username === data.lobbyOwner) {
                this.lobbyOwner.setLobbyOwnerChosen(true)
                this.dialogRef.close()
            } else {
                this.lobby.putLobbyPlayers([{ status: 'chosen', username: this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username }]).subscribe(() => {
                    this.dialogRef.close()
                    window.location.reload()
                })
            }
        })
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
    constructor(public dialogRef: MatDialogRef<StartGame>, private startGameToFalse: LobbyOwnerChooseAndStartGame, private lobby: Lobby, private decoder: Decoder, private getCookie: GetCookie) { }
    lobbyOwner: boolean = false

    ngOnInit() {
        this.checkIfLobbyOwner()
    }

    startGame() {
        this.lobby.putLobbyData({ startGame: true }).subscribe(() => {
            this.dialogRef.close()
            window.location.reload()
        })
    }

    checkIfLobbyOwner() {
        this.lobby.getLobby().subscribe((data: any) => {
            if (this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username === data.lobbyOwner) {
                this.lobbyOwner = true
            } else {
                this.lobbyOwner = false
            }
        })
    }

}