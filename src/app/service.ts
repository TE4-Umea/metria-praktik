import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class SetShowBuildings {
    private _showBuildings = new BehaviorSubject<boolean>(false)
    showBuildings$ = this._showBuildings.asObservable()

    setShowBuildings(showBuildings: boolean) {
        this._showBuildings.next(showBuildings)
    }
}

@Injectable({
    providedIn: 'root'
})
export class PlayersReady {
    private _playersReady = new BehaviorSubject<boolean>(false)
    playersReady$ = this._playersReady.asObservable()

    setPlayersReady(playersReady: boolean) {
        this._playersReady.next(playersReady)
    }
}

@Injectable({
    providedIn: 'root'
})
export class Decoder {
    decoder(token: string) {
        console.log()
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace('-', '+').replace('_', '/')
        return JSON.parse(window.atob(base64))
    }
}