/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { Decoder, GetCookie, NeighboringLan, SetIfDialogOpen, SetLan, SetShowAttack, SetShowBuildings, SetShowEnemies } from '../service'
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
import * as lanResources from '../../assets/lanResources.json'
@Component({
    selector: 'app-user-interface',
    standalone: true,
    imports: [CommonModule, MatSlideToggleModule, DragScrollComponent, DragScrollItemDirective, MatButtonModule],
    templateUrl: './user-interface.component.html',
    styleUrl: './user-interface.component.scss'

})
export class UserInterfaceComponent implements OnInit {
    constructor(public dialog: MatDialog, private setShowAttack: SetShowAttack, private neighboringLan: NeighboringLan, private setIfDialogOpen: SetIfDialogOpen, private setShowBuildings: SetShowBuildings, public router: Router, private setShowEnemies: SetShowEnemies, private decoder: Decoder, private getCookie: GetCookie, private lobby: Lobby, private setLan: SetLan) { }

    @ViewChild('carousel', { read: DragScrollComponent }) ds!: DragScrollComponent

    resources: any = []
    enemyResources: any = []

    information: { [info: string]: string | number } = { Weather: 'Sunny', Date: '2021-01-01', Round: 1, Level: 1 }

    lanResources: any = lanResources
    buildings: any = buildingsData
    areas: any = []

    showDropdown: boolean = false
    showMenu: boolean = false
    showBuildings: boolean = false
    showEnemies: boolean = false
    showAttack: boolean = false

    lobbyOwner: string = ''
    playerName: string = ''
    enemyPlayerNames: string[] = []

    lanChosen: boolean = false
    choosingLanScreen: boolean = true

    playerLan: string = ''
    enemyLan: string = ''
    npcLan: string = ''
    enemy: boolean = false

    player1Active: boolean = false
    player2Active: boolean = false

    whichLanNewBuildingsAt: any = []
    resourcesPerRoundObject: any = []
    newBuildingsOwned: any = []

    lan = ''
    round: number | undefined
    turn: string = ''

    attackPercentage: number = 0
    playerMinPercentage: string = ''
    playerMaxPercentage: string = ''
    selectedLan: any
    lastSelectedLan: any

    updatedAreas: any = []

    ngOnInit() {
        this.getLobbyNames()
        this.toggleBuildingsAndChooseLan('450ms', '350ms')
        this.onScreenCheckLanChoice()
        this.selectLan()
        this.toggleShowEnemies()
        this.getData()
        this.getDataOnce()
        interval(10000).subscribe(() => {
            this.getData()
        })
    }

    attack() {
        let resources: any[] = []
        const username = this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username
        const randomNumber = Math.random() * 100
        if (randomNumber <= this.attackPercentage) {
            this.lobby.getLobby().subscribe((data) => {
                if (this.selectedLan !== this.enemyLan) {
                    const buildings: { name: string; amount: number }[] = []
                    this.buildings.default.forEach((building: { name: any }) => {
                        buildings.push({ 'name': building.name, 'amount': 0 })
                    })
                    const newArea = [{ owner: username, lan: this.selectedLan, buildings: buildings, resourcesPerRound: { Money: 100, BuildingMaterials: 100, Army: 100 } }]
                    data.data.areas.push(newArea)
                    const areas = data.data.areas
                    data.data.resources.forEach((resourcesElement: any) => {
                        if (resourcesElement[0].owner !== username) {
                            resources = [resourcesElement, [{ owner: username, resources: this.concatNumbersJSON(this.resources, this.getSelectedLanResources()) }]]
                        }
                    })
                    this.lobby.putLobbyData({ round: data.data.round, areas: areas, state: data.data.state, resources: resources }).subscribe(() => {
                        window.location.reload()
                    })
                }
            })
        } else {
            console.log('Attack failed!')
        }
    }


    calculateMinMaxAttackPercentage(numSimulations: number) {
        const playerArmy = this.resources.Army
        let enemyArmy
        if (this.selectedLan !== this.enemyLan) {
            enemyArmy = this.getSelectedLanResources().Army
        } else {
            enemyArmy = this.enemyResources.Army
        }

        let minPercentage = Infinity
        let maxPercentage = 0

        for (let sim = 0; sim < numSimulations; sim++) {
            let playerWins = 0

            for (let i = 0; i < numSimulations; i++) {
                const playerDice = this.rollDice(Math.min(playerArmy, 3))
                const enemyDice = this.rollDice(Math.min(enemyArmy, 2))

                const playerLosses = this.countLosses(playerDice, enemyDice)
                const enemyLosses = this.countLosses(enemyDice, playerDice)

                if (playerLosses < enemyLosses) {
                    playerWins++
                }
            }

            const winPercentage = (playerWins / numSimulations) * 100

            minPercentage = Math.min(minPercentage, winPercentage)
            maxPercentage = Math.max(maxPercentage, winPercentage)
        }

        this.playerMinPercentage = minPercentage.toFixed(0)
        this.playerMaxPercentage = maxPercentage.toFixed(0)
    }

    calculateAttackPercentage() {
        const playerArmy = this.resources.Army
        let enemyArmy
        if (this.selectedLan !== this.enemyLan) {
            enemyArmy = this.getSelectedLanResources().Army
        } else {
            enemyArmy = this.enemyResources.Army
        }

        const iterations = 10
        let playerWins = 0

        for (let i = 0; i < iterations; i++) {
            const playerDice = this.rollDice(Math.min(playerArmy, 3))
            const enemyDice = this.rollDice(Math.min(enemyArmy, 2))

            const playerLosses = this.countLosses(playerDice, enemyDice)
            const enemyLosses = this.countLosses(enemyDice, playerDice)

            if (playerLosses < enemyLosses) {
                playerWins++
            }
        }

        const winPercentage = (playerWins / iterations) * 100
        this.attackPercentage = winPercentage
    }

    rollDice(numDice: number) {
        const results = []
        for (let i = 0; i < numDice; i++) {
            results.push(Math.floor(Math.random() * 6) + 1) // Assuming 6-sided dice
        }
        return results.sort((a, b) => b - a) // Sort in descending order
    }

    countLosses(attackerDice: string | any[], defenderDice: string | any[]) {
        let losses = 0
        for (let i = 0; i < Math.min(attackerDice.length, defenderDice.length); i++) {
            if (attackerDice[i] > defenderDice[i]) {
                losses++
            }
        }
        return losses
    }


    endTurn() {
        let resources: any[] = []
        let state: any[] = []
        const username = this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username
        if (this.turn === username) {
            this.lobby.getLobby().subscribe((data) => {
                data.data.resources.forEach((resourcesElement: any) => {
                    if (resourcesElement[0].owner !== username) {
                        resources = [resourcesElement, [{ owner: username, resources: this.resources }]]
                        state = [{ turn: resourcesElement[0].owner }]
                    }
                })
                data.data.areas.forEach((areasElement: any) => {
                    this.updatedAreas.forEach((updatedAreasElement: any) => {
                        if (areasElement[0].owner === username && updatedAreasElement.lan === areasElement[0].lan) {
                            const userArea = areasElement[0]
                            userArea.buildings = updatedAreasElement.buildings
                            userArea.resourcesPerRound = updatedAreasElement.resourcesPerRound
                        }
                    })
                })
                if (username === data.lobbyOwner) {
                    this.round = data.data.round + 1
                }
                const round = (this.round !== undefined) ? this.round : data.data.round
                this.lobby.putLobbyData({ round: round, areas: data.data.areas, state: state, resources: resources }).subscribe(() => {
                    window.location.reload()
                })
            })
        }
    }


    getDataOnce() {
        const username = this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username
        this.lobby.getLobby().subscribe((data) => {
            if (data.data.round) {
                this.information = { Weather: 'Sunny', Date: '2021-01-01', Round: data.data.round, Level: 1 }
                data.data.resources.forEach((element: any) => {
                    if (element[0].owner === username) {
                        this.resources = element[0].resources
                        if (this.round !== data.data.round) {
                            data.data.areas.forEach((element: any) => {
                                if (element[0].owner === username) {
                                    this.resources = this.concatNumbersJSON(this.resources, element[0].resourcesPerRound)
                                }
                            })
                        }
                    } else {
                        this.enemyResources = element[0].resources
                    }
                })
                data.data.areas.forEach((element: any) => {
                    if (element[0].owner === username) {
                        this.playerLan = element[0].lan
                        this.resourcesPerRoundObject = element[0].resourcesPerRound
                        this.newBuildingsOwned = element[0].buildings
                    } else {
                        this.enemyLan = element[0].lan
                    }
                })
            }
        })
    }


    getData() {
        const username = this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username
        this.lobby.getLobby().subscribe((data) => {
            if (data.data.round) {
                this.turn = data.data.state[0].turn
                if (this.turn === username) {
                    this.player1Active = true
                    this.player2Active = false
                } else {
                    this.player2Active = true
                    this.player1Active = false
                }
            }
        })
    }

    toggleShowEnemies() {
        this.setShowEnemies.showEnemies$.subscribe(show => {
            this.showEnemies = show
        })
        this.setShowAttack.showAttack$.subscribe(show => {
            this.showAttack = show
        })
    }

    toggleShowBuildings() {
        this.setShowBuildings.showBuildings$.subscribe(show => {
            this.showBuildings = show
        })
    }

    selectLan() {
        this.setLan.lan$.subscribe(lan => {
            if (this.lastSelectedLan !== lan) {
                this.selectedLan = lan
                this.calculateAttackPercentage()
                this.calculateMinMaxAttackPercentage(1000)
                if (this.selectedLan === this.enemyLan) {
                    this.enemy = true
                } else {
                    this.enemy = false
                }
                this.lastSelectedLan = lan
            }
        })

    }

    getNeighbours() {
        this.neighboringLan.neighboringLan$.subscribe(() => {
        })
    }

    getSelectedLanResources() {
        if (this.selectedLan !== this.enemyLan) {
            const lan = this.lanResources.default.find((l: { name: any }) => l.name === this.selectedLan)
            return lan ? lan.resources : null
        } else {
            return null
        }
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
                        this.toggleShowBuildings()
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

    concatNumbersJSON(object1: { [x: number]: any }, object2: { [x: number]: any }) {
        for (const key in object2) {
            object1[key] += object2[key]
        }
        return object1
    }

    constructBuilding(building: any) {
        this.setLan.lan$.subscribe(lan => {
            this.lan = lan
        })
        this.lobby.getLobby().subscribe((response) => {
            let canBuild = true
            for (const key in building.cost) {
                if (this.resources[key] - building.cost[key] < 0) {
                    canBuild = false
                }
            }
            if (canBuild) {
                for (const key in building.cost) {
                    this.resources[key] -= building.cost[key]
                }
                response.data.areas.forEach((area: any[]) => {
                    const buildingLan = area[0].lan
                    if (buildingLan === this.lan) {
                        const existingAreaIndex = this.updatedAreas.findIndex(
                            (area: { lan: any }) => area.lan === buildingLan
                        )

                        const newBuildingsOwned = existingAreaIndex !== -1
                            ? JSON.parse(JSON.stringify(this.updatedAreas[existingAreaIndex].buildings))
                            : JSON.parse(JSON.stringify(this.newBuildingsOwned))

                        newBuildingsOwned.forEach((buildingInLan: { name: string; amount: number }) => {
                            if (buildingInLan.name === building.name) {
                                buildingInLan.amount += 1
                            }
                        })

                        const resourcesObject = existingAreaIndex !== -1
                            ? { ...this.updatedAreas[existingAreaIndex].resourcesPerRound }
                            : { ...area[0].resourcesPerRound }

                        for (const key in building.output) {
                            // eslint-disable-next-line no-prototype-builtins
                            if (resourcesObject.hasOwnProperty(key)) {
                                resourcesObject[key] += building.output[key] // Add the building output to the existing resources
                            } else {
                                resourcesObject[key] += building.output[key] // If the resource doesn't exist yet, add it
                            }
                        }
                        const updatedArea = {
                            lan: buildingLan,
                            buildings: newBuildingsOwned,
                            resourcesPerRound: resourcesObject,
                        }
                        if (existingAreaIndex !== -1) {
                            this.updatedAreas[existingAreaIndex] = updatedArea
                        } else {
                            this.updatedAreas.push(updatedArea)
                        }

                        this.updatedAreas.forEach((element: any) => {
                            console.log(element.lan)
                        })
                    }
                })
            }
            else {
                alert('Not enough resources')
            }
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
    buildings: any = buildingsData

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
                        const buildings: { name: string; amount: number }[] = []
                        this.buildings.default.forEach((building: { name: any }) => {
                            buildings.push({ 'name': building.name, 'amount': 0 })
                        })
                        const areas = [data.data.areas, [{ owner: username, lan: lan, buildings: buildings, resourcesPerRound: { Money: 100, BuildingMaterials: 100, Army: 100 } }]]
                        const resources = [data.data.resources, [{ owner: username, resources: { Money: 10000, BuildingMaterials: 10000, Army: 10000 } }]]
                        this.lobby.putLobbyData({ areas: areas, state: data.data.state, resources: resources }).subscribe(() => {
                            this.dialogRef.close()
                            window.location.reload()
                        })
                    } else {
                        alert('Someone has already chosen this lan')
                    }
                } else {
                    const buildings: { name: string; amount: number }[] = []
                    this.buildings.default.forEach((building: { name: any }) => {
                        buildings.push({ 'name': building.name, 'amount': 0 })
                    })
                    const areas = [{ owner: username, lan: lan, buildings: buildings, resourcesPerRound: { Money: 100, BuildingMaterials: 100, Army: 100 } }]
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
        this.checkIfStarted()
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