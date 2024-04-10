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
        if (token) {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace('-', '+').replace('_', '/')
            return JSON.parse(window.atob(base64))
        } else {
            return null
        }
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

@Injectable({
    providedIn: 'root'
})
export class SetLan {
    private _lan = new BehaviorSubject<string>('')
    lan$ = this._lan.asObservable()

    setLan(lan: string) {
        this._lan.next(lan)
    }
}

@Injectable({
    providedIn: 'root'
})
export class SetIfDialogOpen {
    private _ifDialogOpen = new BehaviorSubject<boolean>(false)
    ifDialogOpen$ = this._ifDialogOpen.asObservable()

    setIfDialogOpen(ifDialogOpen: boolean) {
        this._ifDialogOpen.next(ifDialogOpen)
    }

}