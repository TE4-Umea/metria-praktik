import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { BehaviorSubject } from 'rxjs'
import { Decoder, GetCookie } from './service'

@Injectable({
    providedIn: 'root'
})
export class SignUpService {
    constructor(private http: HttpClient) { }

    signUp(username: string, password: string) {
        const url = 'http://jupiter.umea-ntig.se:4893/register_user'
        const token = btoa(username + ':' + password)
        const header = {
            headers: new HttpHeaders().set('Authorization', `Basic ${token}`)
        }

        return this.http.post(url, null, header)
    }
}

@Injectable({
    providedIn: 'root'
})
export class SignInService {
    private loginStatus = new BehaviorSubject<boolean>(this.checkLoginStatus())
    currentLoginStatus = this.loginStatus.asObservable()
    constructor(private http: HttpClient, private getCookie: GetCookie) { }

    signIn(username: string, password: string) {
        const url = 'http://jupiter.umea-ntig.se:4893/login'
        const token = btoa(username + ':' + password)
        const header = {
            headers: new HttpHeaders().set('Authorization', `Basic ${token}`)
        }
        this.http.post(url, null, header).subscribe((data) => {
            document.cookie = 'token=' + data + '; samesite=strict; max-age=86400;'
            const cookieToken: string = this.getCookie.getCookie('token') || ''
            if (cookieToken !== '') {
                console.log('Logged in')
                return this.loginStatus.next(true)
            }
            else {
                console.log('Not logged in')
                return this.loginStatus.next(false)
            }
        })
    }

    checkLoginStatus(): boolean {
        const cookieToken: string = this.getCookie.getCookie('token') || ''
        return cookieToken ? true : false
    }
}


@Injectable({
    providedIn: 'root'
})
export class Lobby {
    constructor(private http: HttpClient, private getCookie: GetCookie, private invite: Invite) { }
    url: string = 'http://jupiter.umea-ntig.se:4893/'
    id: string = this.getCookie.getCookie('id') || ''
    header: object = {
        headers: new HttpHeaders().set('Authorization', `Bearer ${this.getCookie.getCookie('token')}`)
    }

    createLobby(players: [{ status: string, username: string }] | JSON | undefined, username: string) {
        const body: object = {
            players: players,
        }
        console.log('createLobby', body, this.header, this.url)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.http.post(this.url + 'lobby', body, this.header).subscribe((data: any) => {
            document.cookie = 'id=' + data.id + '; samesite=strict; max-age=86400;'
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.invite.getInvite().subscribe((id: any) => {
                if (id.lobby === '') {
                    this.invite.putInvite(username, data.id)
                } else {
                    console.log('Player already invited')
                }
            })
        })

    }

    putLobbyData(data: object) {
        const body: object = {
            data: data
        }
        return this.http.put(this.url + this.id, body, this.header).subscribe((data) => {
            console.log(data)
        })
    }

    putLobbyPlayers(players: [{ status: string, username: string }]) {
        const body: object = {
            players: players
        }
        return this.http.put(this.url + 'updatePlayersInLobby/' + this.id, body, this.header).subscribe((data) => {
            console.log(data)
        })
    }

    getLobby() {
        if (this.id !== '') {
            return this.http.get(this.url + 'lobby/' + this.id, this.header)
        } else if (this.id === '') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.invite.getInvite().subscribe((data: any) => {
                document.cookie = 'id=' + data.lobby + '; samesite=strict; max-age=86400;'
                return this.http.get(this.url + 'lobby/' + this.getCookie.getCookie('id'), this.header)
            })
        } else {
            return console.log('No lobby found')
        }
    }


}

@Injectable({
    providedIn: 'root'
})
export class Invite {
    constructor(private http: HttpClient, private getCookie: GetCookie, private decoder: Decoder) { }
    url: string = 'http://jupiter.umea-ntig.se:4893/invite/'
    header: object = {
        headers: new HttpHeaders().set('Authorization', `Bearer ${this.getCookie.getCookie('token')}`)
    }

    putInvite(username: string, id: [{ lobbyID: string }]) {
        const body: object = {
            lobbyID: id
        }
        console.log(this.url + username, body, this.header)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return this.http.put(this.url + username, body, this.header).subscribe((data) => {
            console.log('invite sent')
        })
    }

    getInvite() {
        const username = this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username
        return this.http.get(this.url + username, this.header)
    }
}



