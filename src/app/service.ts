import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class GetCookie {
    getCookie(name: string) {
        const cookies = document.cookie.split('; ')
        for (let i = 0; i < cookies.length; i++) {
            const parts = cookies[i].split('=')
            if (parts[0] === name) {
                return parts[1]
            }
        }
        return null
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
export class LobbyOwner_Invited {
    private _lobbyOwner = new BehaviorSubject<string>('')
    lobbyOwner$ = this._lobbyOwner.asObservable()

    setLobbyOwner(lobbyOwner: string) {
        this._lobbyOwner.next(lobbyOwner)
    }

    private _alreadyInLobby = new BehaviorSubject<boolean>(false)
    alreadyInLobby$ = this._alreadyInLobby.asObservable()

    setAlreadyInLobby(alreadyInLobby: boolean) {
        this._alreadyInLobby.next(alreadyInLobby)
    }
}

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