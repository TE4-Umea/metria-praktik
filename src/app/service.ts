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
export class Decoder {
    decoder(token: string) {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace('-', '+').replace('_', '/')
        return JSON.parse(window.atob(base64))
    }
}

@Injectable({
    providedIn: 'root'
})
export class SetId {
    public _id = new BehaviorSubject<string>('')
    id$ = this._id.asObservable()

    setId(id: string) {
        this._id.next(id)
        console.log('setId', this._id.value, this.id$, 'hej')
    }
}
