import { Routes } from '@angular/router'
import { StartingScreenComponent } from './starting-screen/starting-screen.component'
import { GameComponent } from './game/game.component'

export const routes: Routes = [
    { path: '', component: StartingScreenComponent },
    { path: 'game', component: GameComponent },
]
