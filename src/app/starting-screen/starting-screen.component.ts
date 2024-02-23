import { Component, Injectable, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog, MatDialogRef, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { BehaviorSubject } from 'rxjs'


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
})
export class SignUpDialog {
    constructor(public dialogRef: MatDialogRef<SignUpDialog>, private http: HttpClient) { }

    passwordHide: boolean = true
    confirmPasswordHide: boolean = true

    usernameFormControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)])

    passwordFormControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])

    confirmPasswordFormControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])

    submitSignUp() {
        console.log(typeof this.passwordFormControl.value)
        console.log(typeof this.confirmPasswordFormControl.value)
        console.log(this.passwordFormControl.value !== this.confirmPasswordFormControl.value)
        if (this.passwordFormControl.value !== this.confirmPasswordFormControl.value) {
            const passwordDoesNotMatchError: string = 'Password does not match'
            console.log(passwordDoesNotMatchError)
        }
        else {
            this.http.post('http//localhost:8080/register_user/', (this.usernameFormControl, this.passwordFormControl)).subscribe((response) => {
                console.log(response)
                return response
            })
            console.log('User registered')
        }
    }
}


@Component({
    selector: 'sign-in-dialog',
    templateUrl: 'sign-in-dialog.html',
    styleUrl: './starting-screen.component.scss',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule],
})
export class SignInDialog {
    constructor(public dialogRef: MatDialogRef<SignInDialog>, private http: HttpClient, private authService: AuthService) { }

    passwordHide: boolean = true
    confirmPasswordHide: boolean = true

    usernameFormControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)])

    passwordFormControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])

    submitSignIn() {
        // this.http.post('http//localhost:8080/login/', (this.usernameFormControl, this.passwordFormControl)).subscribe((logInToken) => {
        const logInToken: string = 'hej'
        console.log(logInToken.toString())
        this.authService.setLogInToken(logInToken.toString())
        // })
    }
}

