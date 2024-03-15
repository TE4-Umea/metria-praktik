import { Routes } from '@angular/router'
import { StartingScreenComponent } from './starting-screen/starting-screen.component'
import { GameComponent } from './game/game.component'
import { LobbyScreenComponent } from './lobby-screen/lobby-screen.component'

export const routes: Routes = [
    { path: '', component: StartingScreenComponent },
    { path: 'game', component: GameComponent },
    { path: 'lobby', component: LobbyScreenComponent },
]
