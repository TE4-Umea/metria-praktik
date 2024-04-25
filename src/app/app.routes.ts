import { Routes } from '@angular/router'
import { StartingScreenComponent } from './starting-screen/starting-screen.component'
import { GameComponent } from './game/game.component'
import { LobbyScreenComponent } from './lobby-screen/lobby-screen.component'
import { PageNotFoundComponent } from './page-not-found/page-not-found.component'
import { AuthGuard } from './your-guard.guard'

export const routes: Routes = [
    { path: '', component: StartingScreenComponent },
    { path: 'game', component: GameComponent, canActivate: [AuthGuard] },
    { path: 'lobby', component: LobbyScreenComponent, canActivate: [AuthGuard] },
    { path: '**', component: PageNotFoundComponent },
]

