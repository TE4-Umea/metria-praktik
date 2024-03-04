import { ChangeDetectorRef, Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { BehaviorSubject } from 'rxjs'
import { SetId } from './service'

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
    constructor(private http: HttpClient, private cd: ChangeDetectorRef) { }

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
                this.cd.detectChanges()
                return true
            }
            else {
                console.log('Not logged in')
                return false
            }
        })
        return true
    }

    checkLoginStatus(): boolean {
        return document.cookie.split('=')[1] ? true : false
    }
}


@Injectable({
    providedIn: 'root'
})
export class Lobby {

    constructor(private http: HttpClient, private setId: SetId) { }
    url = 'http://jupiter.umea-ntig.se:4893/lobby/'
    id = this.getCookie('id')
    header = {
        headers: new HttpHeaders().set('Authorization', `Bearer ${this.getCookie('token')}`)
    }

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

    createLobby(players: [{ status: string, username: string }] | JSON | undefined) {
        const body = {
            players: players,
        }
        console.log('createLobby', body, this.header, this.url)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.http.post(this.url, body, this.header).subscribe((data: any) => {
            document.cookie = 'id=' + data.id + '; samesite=strict; max-age=86400;'
            // localStorage.setItem('lobbyId', data.id)
        })
    }

    putLobby(data: object) {
        const body = {
            data: data
        }
        return this.http.put(this.url + this.id, body, this.header)
    }

    getLobby() {
        return this.http.get(this.url + this.id, this.header).subscribe((data) => {
            console.log(data)
        })

    }
}



