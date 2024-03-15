/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Invite, Lobby } from '../http.service'
import { Decoder, GetCookie } from '../service'
import { MatFormFieldModule } from '@angular/material/form-field'
import { HttpClientModule } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatDialogRef, MatDialog } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'



@Component({
    selector: 'app-lobby-screen',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule],
    templateUrl: './lobby-screen.component.html',
    styleUrl: './lobby-screen.component.scss',
    providers: [Lobby, Invite]
})
export class LobbyScreenComponent implements OnInit {
    constructor(public dialog: MatDialog, public router: Router, private invite: Invite, private lobby: Lobby, private decoder: Decoder, private getCookie: GetCookie) { }
    playersReady: boolean = false
    ready: boolean = false
    lobbyOwner: string = ''
    timeout: boolean = true
    players: string[] = []

    ngOnInit() {
        this.refreshPage()
    }

    getPlayerStatus() {
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
                    this.players.push(element.username)
                }
            })

        })
    }

    refreshPage() {
        if (this.timeout) {
            console.log('refresh')
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

    cancelGame(enterAnimationDuration: string, exitAnimationDuration: string): void {
        this.dialog.open(AreYouSureDialog, {
            width: '380px',
            enterAnimationDuration,
            exitAnimationDuration,
        })
    }
}

@Component({
    selector: 'are-you-sure',
    templateUrl: 'are-you-sure.html',
    styleUrl: './lobby-screen.component.scss',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule],
    providers: [Invite]
})
export class AreYouSureDialog {
    constructor(public dialogRef: MatDialogRef<AreYouSureDialog>, private invite: Invite, private decoder: Decoder, private getCookie: GetCookie, private router: Router) { }

    yes() {
        document.cookie = 'id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        this.invite.putInvite(this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username, '').subscribe(() => {
            this.router.navigate(['/'])

        })
    }
}