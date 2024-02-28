import { Component, Injectable, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog, MatDialogRef, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import { SignUpService } from '../http.service'
import { BehaviorSubject } from 'rxjs'
import { HttpClientModule } from '@angular/common/http'
import { SignInService } from '../http.service'

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _logInToken = new BehaviorSubject<string>('')
    logInToken$ = this._logInToken.asObservable()

    setLogInToken(logInToken: string) {
        this._logInToken.next(logInToken)
    }
}


@Component({
    selector: 'app-starting-screen',
    standalone: true,
    imports: [MatButtonModule, CommonModule],
    templateUrl: './starting-screen.component.html',
    styleUrl: './starting-screen.component.scss'
})
export class StartingScreenComponent implements OnInit {
    constructor(public dialog: MatDialog, private authService: AuthService) { }
    logInToken: string = ''



    ngOnInit() {
        this.authService.logInToken$.subscribe(token => {
            this.logInToken = token
        })
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
    providers: [SignUpService]
})
export class SignUpDialog {
    constructor(public dialogRef: MatDialogRef<SignUpDialog>, private signUpService: SignUpService) { }

    passwordHide: boolean = true
    confirmPasswordHide: boolean = true
    checkPasswordMatching: boolean = true

    usernameFormControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)])

    passwordFormControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])

    confirmPasswordFormControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])

    submitSignUp() {
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
    providers: [SignInService]
})
export class SignInDialog {
    constructor(public dialogRef: MatDialogRef<SignInDialog>, private authService: AuthService, private signInService: SignInService) { }

    passwordHide: boolean = true
    confirmPasswordHide: boolean = true

    usernameFormControl: FormControl = new FormControl('', [Validators.required, Validators.maxLength(20)])

    passwordFormControl: FormControl = new FormControl('', [Validators.required, Validators.maxLength(20)])

    submitSignIn() {
        this.signInService.signIn(this.usernameFormControl.value, this.passwordFormControl.value).subscribe((data) => {
            const encrypted = btoa(data as string)
            document.cookie = 'token=' + encrypted + '; samesite=strict; max-age=86400;'

            const cookie = document.cookie.split('=')
            console.log(atob(cookie[1]))
        })

    }
}

@Component({
    selector: 'lobby-settings',
    templateUrl: 'lobby-settings.html',
    styleUrl: './starting-screen.component.scss',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule],
    providers: []
})
export class LobbySettings {
    constructor(public dialogRef: MatDialogRef<LobbySettings>) { }

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
    constructor(public dialogRef: MatDialogRef<LogoutDialog>, private authService: AuthService) { }
    logInToken: string = ''

    ngOnInit() {
        this.authService.logInToken$.subscribe(token => {
            this.logInToken = token
        })
    }

    submitLogout() {
        this.authService.setLogInToken('')
    }

    closeLogout() {
        this.dialogRef.close()
    }

}
