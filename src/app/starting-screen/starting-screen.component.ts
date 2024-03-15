/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog, MatDialogRef, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent } from '@angular/material/dialog'
import { MatSelectModule } from '@angular/material/select'
import { MatButtonModule } from '@angular/material/button'
import { Invite, Lobby, SignInService, SignUpService } from '../http.service'
import { HttpClientModule } from '@angular/common/http'
import { Router } from '@angular/router'
import { Decoder, GetCookie, LobbyOwner_Invited } from '../service'
import { MatOption } from '@angular/material/core'


@Component({
    selector: 'app-starting-screen',
    standalone: true,
    templateUrl: './starting-screen.component.html',
    styleUrl: './starting-screen.component.scss',
    imports: [MatButtonModule, CommonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatFormFieldModule, MatInputModule, MatIconModule, FormsModule, ReactiveFormsModule, HttpClientModule],
    providers: [SignInService, Lobby, Invite,
        { provide: MatDialogRef, useValue: {} }],
})
export class StartingScreenComponent implements OnInit {
    constructor(public dialog: MatDialog, private setLobbyOwner: LobbyOwner_Invited, private signInService: SignInService, private getCookie: GetCookie, private router: Router, private lobby: Lobby, private decoder: Decoder, private invite: Invite) { }
    isLoggedIn: boolean = false
    cookieId: string = this.getCookie.getCookie('id') || ''
    username: string = ''
    timeout: boolean = true
    timeoutUsername: boolean = true

    ngOnInit() {
        this.signInServiceStatus()
        this.getUsername()
    }

    signInServiceStatus() {
        this.signInService.currentLoginStatus.subscribe(status => {
            this.isLoggedIn = status
        })
    }

    getUsername() {
        const decodedToken = this.decoder.decoder(this.getCookie.getCookie('token') || '')
        if (decodedToken && decodedToken.user_information) {
            this.username = decodedToken.user_information.username
        } else {
            this.username = ''
        }
    }

    continueLobby() {
        this.router.navigate(['/lobby'])
    }

    refreshPage(enterAnimationDuration: string, exitAnimationDuration: string): void {
        if (this.cookieId === '') {
            this.lobby.getLobby().subscribe((data: any) => {
                this.setLobbyOwner.setLobbyOwner(data.lobbyOwner)
                data.players.forEach((element: { status: string; username: string }) => {
                    if (element.status === 'invited' && element.username === this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username) {
                        this.dialog.open(LobbyInvite, {
                            width: '380px',
                            enterAnimationDuration,
                            exitAnimationDuration,
                        })
                    } else if (element.status === 'accepted' || element.status === 'ready' && element.username === this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username) {
                        this.dialog.open(AlreadyInLobby, {
                            width: '380px',
                            enterAnimationDuration,
                            exitAnimationDuration,
                        })
                    }
                })
            })
        } else {
            this.dialog.open(AlreadyInLobby, {
                width: '380px',
                enterAnimationDuration,
                exitAnimationDuration,
            })
        }
    }

    refreshButton() {
        if (this.timeout) {
            this.refreshPage('450ms', '350ms')
            this.timeout = false
        }
        setTimeout(() => {
            this.timeout = true
        }, 10000)
    }

    openLogout(enterAnimationDuration: string, exitAnimationDuration: string): void {
        this.dialog.open(LogoutDialog, {
            width: '380px',
            enterAnimationDuration,
            exitAnimationDuration,
        })
    }

    openLobbySettings(enterAnimationDuration: string, exitAnimationDuration: string): void {
        this.dialog.open(LobbySettings, {
            width: '380px',
            enterAnimationDuration,
            exitAnimationDuration,
        })
    }

    openSignUp(enterAnimationDuration: string, exitAnimationDuration: string): void {
        this.dialog.open(SignUpDialog, {
            width: '380px',
            enterAnimationDuration,
            exitAnimationDuration,
        })
    }

    openSignIn(enterAnimationDuration: string, exitAnimationDuration: string): void {
        this.dialog.open(SignInDialog, {
            width: '380px',
            enterAnimationDuration,
            exitAnimationDuration,
        })
    }
}

@Component({
    selector: 'sign-up-dialog',
    templateUrl: 'sign-up-dialog.html',
    styleUrl: './starting-screen.component.scss',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule],
    providers: [SignUpService, SignInService]
})
export class SignUpDialog {
    constructor(public dialogRef: MatDialogRef<SignUpDialog>, private signInService: SignInService, private signUpService: SignUpService) { }

    passwordHide: boolean = true
    confirmPasswordHide: boolean = true
    checkPasswordMatching: boolean = true

    usernameFormControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)])

    passwordFormControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])

    confirmPasswordFormControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])

    submitSignUp() {

        if (this.passwordFormControl.value !== this.confirmPasswordFormControl.value) {
            const passwordDoesNotMatchError: string = 'Password does not match'
            console.log(passwordDoesNotMatchError)
        }
        else {
            this.signUpService.signUp(this.usernameFormControl.value, this.passwordFormControl.value).subscribe(() => {
                this.dialogRef.close()
            })
        }
    }
}


@Component({
    selector: 'sign-in-dialog',
    templateUrl: 'sign-in-dialog.html',
    styleUrl: './starting-screen.component.scss',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule],
    providers: [SignInService]
})
export class SignInDialog {
    constructor(public dialogRef: MatDialogRef<SignInDialog>, private signInService: SignInService) { }

    passwordHide: boolean = true
    confirmPasswordHide: boolean = true

    usernameFormControl: FormControl = new FormControl('', [Validators.required, Validators.maxLength(20)])

    passwordFormControl: FormControl = new FormControl('', [Validators.required, Validators.maxLength(20)])

    submitSignIn() {
        this.signInService.signIn(this.usernameFormControl.value, this.passwordFormControl.value).subscribe(() => {
            this.dialogRef.close()
            window.location.reload()
        })
    }
}

@Component({
    selector: 'lobby-settings',
    templateUrl: 'lobby-settings.html',
    styleUrl: './starting-screen.component.scss',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule, MatOption, MatSelectModule],
    providers: [Lobby, Invite]
})
export class LobbySettings {
    constructor(public dialogRef: MatDialogRef<LobbySettings>, private lobby: Lobby, private router: Router, private invite: Invite) { }
    selectedNumberOfPlayers: number = 0

    counter(i: number) {
        return new Array(i)
    }

    usernameFormControl: FormControl = new FormControl('', [Validators.required, Validators.maxLength(20)])

    submitCreateLobby() {
        const players: [{ status: string, username: string }] = [{ status: 'invited', username: this.usernameFormControl.value },]
        this.lobby.createLobby(players, this.usernameFormControl.value)
        this.router.navigate(['/lobby'])
        this.dialogRef.close()
    }
    cancelLobby() {
        this.dialogRef.close()
    }
}

@Component({
    selector: 'logout-dialog',
    templateUrl: 'logout-dialog.html',
    styleUrl: './starting-screen.component.scss',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule],
    providers: []
})
export class LogoutDialog {
    constructor(public dialogRef: MatDialogRef<LogoutDialog>) { }

    submitLogout() {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie = 'id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        window.location.reload()
    }

}


@Component({
    selector: 'already-in-lobby',
    templateUrl: 'already-in-lobby.html',
    styleUrl: './starting-screen.component.scss',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule],
    providers: [Lobby, Invite]
})
export class AlreadyInLobby {
    constructor(public dialogRef: MatDialogRef<LobbyInvite>, private lobby: Lobby, private decoder: Decoder, private getCookie: GetCookie, private router: Router, private invite: Invite) { }
    cookieId: string = this.getCookie.getCookie('id') || ''

    continue() {
        this.setCookieId()
        this.router.navigate(['/lobby'])
        this.dialogRef.close()
    }

    setCookieId() {
        this.invite.getInvite().subscribe((data: any) => {
            document.cookie = 'id=' + data.lobby + '; samesite=strict; max-age=86400;'
        })
    }

    cancelLobby() {
        const players: [{ status: string, username: string }] = [{ status: 'left', username: this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username }]
        this.invite.putInvite(this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username, '').subscribe(() => {
            this.lobby.putLobbyPlayers(players).subscribe(() => {
                document.cookie = 'id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                this.dialogRef.close()
            })
        })
    }
}


@Component({
    selector: 'lobby-invite',
    templateUrl: 'lobby-invite.html',
    styleUrl: './starting-screen.component.scss',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule],
    providers: [Lobby, Invite]
})
export class LobbyInvite {
    constructor(public dialogRef: MatDialogRef<LobbyInvite>, private setlobbyOwner: LobbyOwner_Invited, private lobby: Lobby, private decoder: Decoder, private router: Router, private getCookie: GetCookie, private invite: Invite) { }
    lobbyOwner: string = ''

    ngOnInit() {
        this.setLobbyOwner()
        this.setCookieId()
    }

    ngOnDestroy() {
        this.lobby.getLobby().subscribe((data: any) => {
            data.players.forEach((element: { status: string; username: string }) => {
                if (element.status === 'accepted' && element.username === this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username) {
                    this.router.navigate(['/lobby'])
                }
                else {
                    document.cookie = 'id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                }
            })
        })
    }

    setCookieId() {
        this.invite.getInvite().subscribe((data: any) => {
            document.cookie = 'id=' + data.lobby + '; samesite=strict; max-age=86400;'
        })
    }

    setLobbyOwner() {
        this.setlobbyOwner.lobbyOwner$.subscribe((data) => {
            this.lobbyOwner = data
        })
    }

    accept() {
        const players: [{ status: string, username: string }] = [{ status: 'accepted', username: this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username }]
        this.lobby.putLobbyPlayers(players).subscribe(() => {
            this.dialogRef.close()
        })
    }

    reject() {
        const players: [{ status: string, username: string }] = [{ status: 'rejected', username: this.decoder.decoder(this.getCookie.getCookie('token') || '').user_information.username }]
        this.lobby.putLobbyPlayers(players).subscribe(() => {
            this.dialogRef.close()
        })
    }
}