import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog, MatDialogRef, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import { GetCookie, Lobby, SignInService, SignUpService } from '../http.service'
import { HttpClientModule } from '@angular/common/http'
import { Router } from '@angular/router'
import { Decoder } from '../service'

@Component({
    selector: 'lobby-invite',
    templateUrl: 'lobby-invite.html',
    styleUrl: './starting-screen.component.scss',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule],
    providers: [Lobby]
})
export class LobbyInvite {
    constructor(public dialogRef: MatDialogRef<LobbyInvite>, private lobby: Lobby, private decoder: Decoder, private router: Router) { }

    accept() {
        const players: [{ status: string, username: string }] = [{ status: 'accepted', username: this.decoder.decoder(document.cookie).username }]
        this.lobby.putLobby(players)
        this.router.navigate(['/lobby'])
        this.dialogRef.close()
    }
    reject() {
        const players: [{ status: string, username: string }] = [{ status: 'rejected', username: this.decoder.decoder(document.cookie).username }]
        this.lobby.putLobby(players)
        this.dialogRef.close()
    }
}

@Component({
    selector: 'app-starting-screen',
    standalone: true,
    templateUrl: './starting-screen.component.html',
    styleUrl: './starting-screen.component.scss',
    imports: [MatButtonModule, CommonModule, LobbyInvite],
    providers: [SignInService, Lobby,
        { provide: MatDialogRef, useValue: {} }],
})
export class StartingScreenComponent implements OnInit {
    constructor(public dialog: MatDialog, private signInService: SignInService, private getCookie: GetCookie, private router: Router, private lobby: Lobby) { }
    isLoggedIn: boolean = false
    cookieId: string = this.getCookie.getCookie('id') || ''
    invited: boolean = false

    ngOnInit() {
        this.signInService.currentLoginStatus.subscribe(status => {
            this.isLoggedIn = status
        })
    }

    continueLobby() {
        this.router.navigate(['/lobby'])
    }

    refreshPage(enterAnimationDuration: string, exitAnimationDuration: string): void {
        this.lobby.getLobby()
        if (!this.invited) {
            this.dialog.open(LobbyInvite, {
                width: '380px',
                enterAnimationDuration,
                exitAnimationDuration,
            })
        }
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
    constructor(public dialogRef: MatDialogRef<SignUpDialog>, private signUpService: SignUpService, private signInService: SignInService) { }

    passwordHide: boolean = true
    confirmPasswordHide: boolean = true
    checkPasswordMatching: boolean = true

    usernameFormControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)])

    passwordFormControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])

    confirmPasswordFormControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])

    async submitSignUp() {
        console.log(this.passwordFormControl.value === this.confirmPasswordFormControl.value)

        if (this.passwordFormControl.value !== this.confirmPasswordFormControl.value) {
            const passwordDoesNotMatchError: string = 'Password does not match'
            console.log(passwordDoesNotMatchError)
        }
        else {
            this.signUpService.signUp(this.usernameFormControl.value, this.passwordFormControl.value).subscribe((data) => {
                console.log(data)
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
    providers: [SignInService, StartingScreenComponent]
})
export class SignInDialog {
    constructor(public dialogRef: MatDialogRef<SignInDialog>, private signInService: SignInService, private startingScreenComponent: StartingScreenComponent) { }

    passwordHide: boolean = true
    confirmPasswordHide: boolean = true

    usernameFormControl: FormControl = new FormControl('', [Validators.required, Validators.maxLength(20)])

    passwordFormControl: FormControl = new FormControl('', [Validators.required, Validators.maxLength(20)])

    submitSignIn() {
        this.signInService.signIn(this.usernameFormControl.value, this.passwordFormControl.value)
    }
}

@Component({
    selector: 'lobby-settings',
    templateUrl: 'lobby-settings.html',
    styleUrl: './starting-screen.component.scss',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule],
    providers: [Lobby]
})
export class LobbySettings {
    constructor(public dialogRef: MatDialogRef<LobbySettings>, private lobby: Lobby, private router: Router) { }

    usernameFormControl: FormControl = new FormControl('', [Validators.required, Validators.maxLength(20)])


    submitCreateLobby() {
        const players: [{ status: string, username: string }] = [{ status: 'invited', username: this.usernameFormControl.value }]
        this.lobby.createLobby(players)
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
    }

    closeLogout() {
        this.dialogRef.close()
    }

}
