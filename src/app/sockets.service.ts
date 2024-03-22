import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { io } from 'socket.io-client'

@Injectable({
    providedIn: 'root'
})
export class SocketsService {

    constructor() { }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket: any

    connectToBackend(token: string) {
        this.socket = io('ws://localhost:8080', {
            extraHeaders: {
                authorization: 'bearer ' + token
            }
        })
        this.socket.connect()
        console.log('Connected')
    }

    sendInvite(data: { 'lobby': string, 'username': string }) {
        this.socket.emit('invite', data)
        console.log('Sending invite')
    }

    getInvite() {
        const observable = new Observable<{ 'lobby': string, 'username': string }>(observer => {
            if (this.socket) {
                console.log(this.socket)
                this.socket.on('invited', (data: { 'lobby': string, 'username': string }) => {
                    observer.next(data)
                })
            }
        })
        return observable
    }

    joinLobby(lobby: string) {
        this.socket.emit('join', lobby)
    }
}
