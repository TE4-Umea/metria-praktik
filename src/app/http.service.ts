import { ChangeDetectorRef, Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
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
    constructor(private http: HttpClient, private cd: ChangeDetectorRef, private getCookie: GetCookie) { }

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
    constructor(private http: HttpClient, private getCookie: GetCookie) { }
    url = 'http://jupiter.umea-ntig.se:4893/lobby/'
    id = this.getCookie.getCookie('id')
    header = {
        headers: new HttpHeaders().set('Authorization', `Bearer ${this.getCookie.getCookie('token')}`)
    }

    createLobby(players: [{ status: string, username: string }] | JSON | undefined) {
        const body = {
            players: players,
        }
        console.log('createLobby', body, this.header, this.url)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.http.post(this.url, body, this.header).subscribe((data: any) => {
            document.cookie = 'id=' + data.id + '; samesite=strict; max-age=86400;'
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



