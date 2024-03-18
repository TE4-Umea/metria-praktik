/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'
import { Decoder, GetCookie } from './service'
import { Router } from '@angular/router'

@Injectable({
    providedIn: 'root'
})
export class SignUpService {
    constructor(private http: HttpClient, private signInService: SignInService) { }

    signUp(username: string, password: string) {
        const url = 'http://jupiter.umea-ntig.se:4893/register_user'
        const token = btoa(username + ':' + password)
        const header = {
            headers: new HttpHeaders().set('Authorization', `Basic ${token}`)
        }

        return new Observable(observer => {
            this.http.post(url, null, header).subscribe(() => {
                observer.next(this.signInService.signIn(username, password))
                observer.complete()
            })
        })

    }
}

@Injectable({
    providedIn: 'root'
})
export class SignInService {
    private loginStatus = new BehaviorSubject<boolean>(this.checkLoginStatus())
    currentLoginStatus = this.loginStatus.asObservable()
    constructor(private http: HttpClient, private getCookie: GetCookie) { }

    signIn(username: string, password: string): Observable<any> {
        const url = 'http://jupiter.umea-ntig.se:4893/login'
        const token = btoa(username + ':' + password)
        const header = {
            headers: new HttpHeaders().set('Authorization', `Basic ${token}`)
        }
        return new Observable(observer => {
            this.http.post(url, null, header).subscribe((data) => {
                document.cookie = 'token=' + data + '; samesite=strict; max-age=86400;'
                if (data !== '') {
                    console.log('Logged in')
                    observer.next(this.loginStatus.next(true))
                    observer.complete()
                }
                else {
                    console.log('Not logged in')
                    observer.next(this.loginStatus.next(false))
                    observer.complete()
                }
            })
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
    constructor(private http: HttpClient, private router: Router, private getCookie: GetCookie, private invite: Invite, private decoder: Decoder) { }
    url: string = 'http://jupiter.umea-ntig.se:4893/'
    id: string = this.getCookie.getCookie('id') || ''
    header: object = {
        headers: new HttpHeaders().set('Authorization', `Bearer ${this.getCookie.getCookie('token')}`)
    }

    createLobby(players: [{ status: string, username: string }] | JSON | undefined, username: string) {
        const body: object = {
            players: players,
        }
        return this.http.post(this.url + 'lobby', body, this.header).subscribe(
            (data: any) => {
                document.cookie = 'id=' + data.id + '; samesite=strict; max-age=86400;'
                this.invite.putInvite(username, data.id).subscribe(() => {
                })
                this.invite.putInvite(this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username, data.id).subscribe(() => {
                })
                this.router.navigate(['/lobby'])
            },
            (error: any) => {
                console.log(error, 'Wrong username')
            }
        )
    }

    putLobbyData(data: object) {
        const body: object = {
            data: data
        }
        return this.http.put(this.url + this.id, body, this.header).subscribe(() => {
        })
    }

    putLobbyPlayers(players: [{ status: string, username: string }]) {
        const body: object = {
            players: players
        }
        return this.http.put(this.url + 'updatePlayersInLobby/' + this.getCookie.getCookie('id'), body, this.header)
    }



    getLobby(): Observable<any> {
        if (this.id !== '') {
            return this.http.get(this.url + 'lobby/' + this.id, this.header)
        } else {
            return new Observable(observer => {
                this.invite.getInvite().subscribe((data: any) => {
                    this.http.get(this.url + 'lobby/' + data.lobby, this.header).subscribe(result => {
                        observer.next(result)
                        observer.complete()
                    })
                })
            })
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

    putInvite(username: string, id: string | [{ lobbyId: string }]) {
        const body: object = {
            lobbyID: id
        }
        return new Observable(observer => {
            this.http.put(this.url + username, body, this.header).subscribe(() => {
                observer.next()
                observer.complete()
            })
        })
    }

    getInvite() {
        const username = this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username
        return this.http.get(this.url + username, this.header)
    }
}

