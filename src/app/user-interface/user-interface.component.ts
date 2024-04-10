/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { Decoder, GetCookie, SetIfDialogOpen, SetLan, SetShowBuildings } from '../service'
import { DragScrollComponent, DragScrollItemDirective } from 'ngx-drag-scroll'

import { Lobby } from '../http.service'
import { Observable, interval } from 'rxjs'
import { MatButtonModule } from '@angular/material/button'
import { Router } from '@angular/router'
import { HttpClientModule } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatDialogRef, MatDialog } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import * as buildingsData from '../../assets/buildings.json'
@Component({
    selector: 'app-user-interface',
    standalone: true,
    imports: [CommonModule, MatSlideToggleModule, DragScrollComponent, DragScrollItemDirective, MatButtonModule],
    templateUrl: './user-interface.component.html',
    styleUrl: './user-interface.component.scss'

})
export class UserInterfaceComponent implements OnInit {
    constructor(public dialog: MatDialog, private setIfDialogOpen: SetIfDialogOpen, private setShowBuildings: SetShowBuildings, public router: Router, private decoder: Decoder, private getCookie: GetCookie, private lobby: Lobby) { }

    @ViewChild('carousel', { read: DragScrollComponent }) ds!: DragScrollComponent

    resources: { [resource: string]: number } = { Money: 500, BuildingMaterials: 200, Army: 300 }

    information: { [info: string]: string | number } = { Weather: 'Sunny', Date: '2021-01-01', Round: 1, Level: 1 }

    buildings: any = buildingsData

    showDropdown: boolean = false
    showMenu: boolean = false
    showBuildings: boolean = false

    lobbyOwner: string = ''
    playerName: string = ''
    enemyPlayerNames: string[] = []

    lanChosen: boolean = false
    choosingLanScreen: boolean = true

    player1Lan: string = ''
    player2Lan: string = ''

    player2Active: boolean = false

    turn: string = ''

    ngOnInit() {
        this.getLobbyNames()
        this.toggleBuildingsAndChooseLan('450ms', '350ms')
        this.onScreenCheckLanChoice()
        this.getData()
    }


    endTurn() {
        const username = this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username
        if (this.turn === username) {
            this.lobby.getLobby().subscribe((data) => {
                data.data.resources.forEach((resourcesElement: any) => {
                    console.log(resourcesElement[0].owner)
                    if (resourcesElement[0].owner !== username) {
                        const resources = [resourcesElement, [{ owner: username, resources: this.resources }]]
                        const state = [{ turn: resourcesElement[0].owner }]
                        console.log()
                        data.data.areas.forEach((areasElement: any) => {
                            if (areasElement[0].owner !== username) {
                                const areas = [areasElement, [{ owner: username, lan: 'lan', buildings: this.buildings, resourcesPerRound: areasElement[0].resourcesPerRound }]]
                                console.log(areas, state, resources)
                                // this.lobby.putLobbyData({ round: data.data.round + 1, areas: areas, state: state, resources: resources }).subscribe(() => {
                                //     window.location.reload()
                                // })
                            }
                        })
                    }
                })
            })
        } else {
            alert('Not your turn')
        }
    }


    getData() {
        interval(10000).subscribe(() => {
            this.lobby.getLobby().subscribe((data) => {
                if (data.data.round) {
                    data.data.resources.forEach((element: any) => {
                        if (element[0].owner === this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username) {
                            this.resources = element[0].resources
                        }
                    })
                    this.information = { Weather: 'Sunny', Date: '2021-01-01', Round: data.data.round, Level: 1 }
                    this.turn = data.data.state[0].turn
                    console.log(this.turn)
                }
            })
        })
    }


    onScreenCheckLanChoice() {
        this.lobby.getLobby().subscribe((data) => {
            if (!data.data.round) {
                this.setIfDialogOpen.ifDialogOpen$.subscribe(ifDialogOpen => {
                    setTimeout(() => {
                        if (ifDialogOpen === true) {
                            return
                        } else if (ifDialogOpen === false) {
                            this.checkLanChoose('450ms', '350ms')
                        }
                    }, 10000)
                })
            }
        })
    }

    checkLobbyOwnerChosenBoolean(): Observable<boolean> {
        return new Observable<boolean>(observer => {
            this.lobby.getLobby().subscribe((data) => {
                let lobbyOwnerChosen = false
                if (data.data.areas) {
                    data.data.areas.forEach((element: any) => {
                        if (Array.isArray(element)) {
                            element.forEach((subElement: any) => {
                                if (subElement.owner === this.lobbyOwner) {
                                    lobbyOwnerChosen = true
                                }
                            })
                        } else if (element.owner === this.lobbyOwner) {
                            lobbyOwnerChosen = true
                        }
                    })
                } else {
                    lobbyOwnerChosen = false
                }
                observer.next(lobbyOwnerChosen)
                observer.complete()
            })
        })
    }

    toggleBuildingsAndChooseLan(enterAnimationDuration: string, exitAnimationDuration: string): void {
        const username = this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username
        this.checkLobbyOwnerChosenBoolean().subscribe(lobbyOwnerChosen => {
            this.setShowBuildings.showBuildings$.subscribe(show => {
                this.lobby.getLobby().subscribe((data) => {
                    if (data.data.round === undefined) {
                        if (this.lanChosen === false && username !== this.lobbyOwner) {
                            if (show === true) {
                                this.dialog.open(LanChoose, {
                                    width: '380px',
                                    enterAnimationDuration,
                                    exitAnimationDuration,
                                })
                            }
                        } else if (username === this.lobbyOwner && lobbyOwnerChosen === false) {
                            if (show === true) {
                                console.log('open', lobbyOwnerChosen)
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
        const username = this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username
        this.checkLobbyOwnerChosenBoolean().subscribe(lobbyOwnerChosen => {
            this.lobby.getLobby().subscribe((data) => {
                data.players.forEach((element: { status: string; username: string }) => {
                    if (element.status === 'chosen') {
                        this.lanChosen = true
                    }
                })
                console.log(this.lanChosen, lobbyOwnerChosen)
                if (this.lanChosen === true && lobbyOwnerChosen === true) {
                    this.dialog.open(StartGame, {
                        width: '380px',
                        enterAnimationDuration,
                        exitAnimationDuration,
                    })
                } else if (this.lanChosen === true && lobbyOwnerChosen === false && username !== this.lobbyOwner) {
                    this.dialog.open(StartGame, {
                        width: '380px',
                        enterAnimationDuration,
                        exitAnimationDuration,
                    })
                } else if (this.lanChosen === false && lobbyOwnerChosen === true && username === this.lobbyOwner) {
                    this.dialog.open(StartGameLobbyOwner, {
                        width: '380px',
                        enterAnimationDuration,
                        exitAnimationDuration,
                    })
                }
            })
        })
    }

    getLobbyNames() {
        this.playerName = this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username
        this.lobby.getLobby().subscribe((data) => {
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
    constructor(public dialogRef: MatDialogRef<LanChoose>, private setLan: SetLan, private lobby: Lobby, private decoder: Decoder, private getCookie: GetCookie) { }
    lan: string = ''

    ngOnInit() {
        this.setLan.lan$.subscribe(lan => {
            this.lan = lan
        })
    }

    buttonChooseLan() {
        this.lobby.getLobby().subscribe((data) => {
            if (this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username === data.lobbyOwner) {
                this.putLobbyDataState()

            } else {
                this.lobby.putLobbyPlayers([{ status: 'chosen', username: this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username }]).subscribe(() => {
                    this.putLobbyDataState()
                })
            }
        })

    }

    putLobbyDataState() {
        const username = this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username
        this.setLan.lan$.subscribe(lan => {
            this.lobby.getLobby().subscribe((data) => {
                if (data.data.areas === true || data.data.areas !== undefined) {
                    if (data.data.areas[0].lan && lan !== data.data.areas[0].lan[0]) {
                        const areas = [data.data.areas, [{ owner: username, lan: lan, buildings: {}, resourcesPerRound: { Money: 100, BuildingMaterials: 100, Army: 100 } }]]
                        const resources = [data.data.resources, [{ owner: username, resources: { Money: 10000, BuildingMaterials: 10000, Army: 10000 } }]]
                        this.lobby.putLobbyData({ areas: areas, state: data.data.state, resources: resources }).subscribe(() => {
                            this.dialogRef.close()
                            window.location.reload()
                        })
                    } else {
                        alert('Someone has already chosen this lan')
                    }
                } else {
                    const areas = [{ owner: username, lan: lan, buildings: {}, resourcesPerRound: { Money: 100, BuildingMaterials: 100, Army: 100 } }]
                    const state = [{ turn: username }]
                    const resources = [{ owner: username, resources: { Money: 10000, BuildingMaterials: 10000, Army: 10000 } }]
                    this.lobby.putLobbyData({ areas: areas, state: state, resources: resources }).subscribe(() => {
                        this.dialogRef.close()
                        window.location.reload()
                    })
                }
            })
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
export class StartGame implements OnInit, OnDestroy {
    constructor(public dialogRef: MatDialogRef<StartGame>, private setIfDialogOpen: SetIfDialogOpen, private lobby: Lobby, private decoder: Decoder, private getCookie: GetCookie) { }
    lobbyOwner: boolean = false

    ngOnInit() {
        interval(10000).subscribe(() => {
            this.checkIfStarted()
        })
        this.checkIfLobbyOwner()
        this.setIfDialogOpen.setIfDialogOpen(true)
    }

    ngOnDestroy() {
        this.setIfDialogOpen.setIfDialogOpen(false)
    }

    startGame() {
        this.lobby.getLobby().subscribe((data) => {
            this.lobby.putLobbyData({ round: 1, areas: data.data.areas, state: data.data.state, resources: data.data.resources }).subscribe(() => {
                this.dialogRef.close()
                window.location.reload()
            })
        })
    }

    checkIfStarted() {
        this.lobby.getLobby().subscribe((data) => {
            if (data.data.round) {
                window.location.reload()
            }
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


@Component({
    selector: 'start-game-lobby-owner',
    templateUrl: 'start-game-lobby-owner.html',
    styleUrl: '../starting-screen/starting-screen.component.scss',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule],
    providers: []
})
export class StartGameLobbyOwner {
    constructor(public dialogRef: MatDialogRef<StartGameLobbyOwner>, private setIfDialogOpen: SetIfDialogOpen, private lobby: Lobby, private decoder: Decoder, private getCookie: GetCookie) { }
    boolean: boolean = false


    ngOnInit() {
        this.checkIfStarted()
        this.setIfDialogOpen.setIfDialogOpen(true)
    }

    ngOnDestroy() {
        this.setIfDialogOpen.setIfDialogOpen(false)
    }

    checkIfStarted() {
        this.lobby.getLobby().subscribe((data) => {
            if (data.data.round) {
                window.location.reload()
            }
        })
    }

}