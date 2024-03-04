import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { BehaviorSubject } from 'rxjs'

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
    constructor(private http: HttpClient) { }

    signIn(username: string, password: string) {
        const url = 'http://jupiter.umea-ntig.se:4893/login'
        const token = btoa(username + ':' + password)
        const header = {
            headers: new HttpHeaders().set('Authorization', `Basic ${token}`)
        }
        this.http.post(url, null, header).subscribe((data) => {
            document.cookie = 'token=' + data + '; samesite=strict; max-age=86400;'
            const cookie = document.cookie.split('=')
            if (cookie[1] !== '') {
                console.log('Logged in')
                return this.loginStatus.next(true)
            }
        })
    }

    checkLoginStatus(): boolean {
        return document.cookie.split('=')[1] ? true : false
    }
}


@Injectable({
    providedIn: 'root'
})
export class Lobby {
    constructor(private http: HttpClient) { }
    url = 'http://jupiter.umea-ntig.se:4893/lobby/'
    id: string = ''

    createLobby(players: [{ status: string, username: string }] | JSON | undefined) {
        const body = {
            players: players,
        }
        const header = {
            headers: new HttpHeaders().set('Authorization', `Bearer ${document.cookie.split('=')[1]}`)
        }
        console.log('createLobby', body, header, this.url)
        return this.http.post(this.url, body, header).subscribe((data) => {
            console.log(data)
        })
    }

    putLobby(data: object) {
        const body = {
            data: data
        }

        return this.http.put(this.url + this.id, body)
    }

    getLobby() {
        return this.http.get(this.url + this.id)
    }
}

