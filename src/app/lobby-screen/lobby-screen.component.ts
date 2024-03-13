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
    constructor(private router: Router, private lobby: Lobby, private decoder: Decoder, private getCookie: GetCookie) { }
    playersReady: boolean = false
    ready: boolean = false

    ngOnInit() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.lobby.getLobby().subscribe((data: any) => {
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
        window.location.reload()
    }

    readyUp() {
        const players: [{ status: string, username: string }] = [{ status: 'ready', username: this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username }]
        this.lobby.putLobby(players, {})
    }

    startGame() {
        console.log('start')
        this.router.navigate(['/game'])
    }

    backToStartingScreen() {
        this.router.navigate(['/'])
    }

    cancelGame() {
        document.cookie = 'id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        this.backToStartingScreen()
    }
}