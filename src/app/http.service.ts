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
            const encrypted = btoa(data as string)
            document.cookie = 'token=' + encrypted + '; samesite=strict; max-age=86400;'

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

    createLobby(username: string, data: { [key: string]: string }) {
        const body = {
            username: username,
            data: data
        }

        return this.http.post(this.url, body)
    }

    putLobby(username: string, data: { [key: string]: string }, id: string) {
        const body = {
            username: username,
            data: data
        }

        return this.http.post(this.url + id, body)
    }

    getLobby(username: string, data: { [key: string]: string }, id: string) {
        const body = {
            username: username,
            data: data
        }

        return this.http.post(this.url + id, body)
    }
}

