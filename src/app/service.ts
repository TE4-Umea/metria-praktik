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
export class SetLogInToken {
    private _logInToken = new BehaviorSubject<boolean>(false)
    logInToken$ = this._logInToken.asObservable()

    setLogInToken(logInToken: boolean) {
        this._logInToken.next(logInToken)
    }
}