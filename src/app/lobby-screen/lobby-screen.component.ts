import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Invite, Lobby } from '../http.service'
import { Decoder, GetCookie } from '../service'

@Component({
    selector: 'app-lobby-screen',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './lobby-screen.component.html',
    styleUrl: './lobby-screen.component.scss',
    providers: [Lobby, Invite]
})
export class LobbyScreenComponent implements OnInit {
    constructor(public router: Router, private invite: Invite, private lobby: Lobby, private decoder: Decoder, private getCookie: GetCookie) { }
    playersReady: boolean = false
    ready: boolean = false
    lobbyOwner: string = ''
    timeout: boolean = false


    ngOnInit() {
        this.refreshPage()
    }

    getPlayerStatus() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.lobby.getLobby().subscribe((data: any) => {
            if (this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username === data.lobbyOwner) {
                this.ready = true
            }
            this.lobbyOwner = data.lobbyOwner
            data.players.forEach((element: { status: string; username: string }) => {
                console.log(element.status)
                if (element.status === 'ready') {
                    this.ready = true
                    this.playersReady = true
                }
            })

        })
    }

    refreshPage() {
        if (this.timeout) {
            this.timeout = false
            this.getPlayerStatus()
        }
        setTimeout(() => {
            this.timeout = true
        }, 10000)
    }

    readyUp() {
        if (this.lobbyOwner === this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username) {
            this.getPlayerStatus()
        } else {
            const players: [{ status: string, username: string }] = [{ status: 'ready', username: this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username }]
            this.lobby.putLobbyPlayers(players).subscribe(() => {
                this.getPlayerStatus()
            })
        }
    }

    startGame() {
        console.log('start')
        this.router.navigate(['/game'])
    }

    cancelGame() {
        document.cookie = 'id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        this.invite.putInvite(this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username, '').subscribe(() => {
            this.router.navigate(['/'])
        })
    }
}
