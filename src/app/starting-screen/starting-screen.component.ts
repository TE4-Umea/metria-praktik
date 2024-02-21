import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import {FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms'
import { MatDialog, MatDialogRef, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'


@Component({
    selector: 'app-starting-screen',
    standalone: true,
    imports: [MatButtonModule],
    templateUrl: './starting-screen.component.html',
    styleUrl: './starting-screen.component.scss'
})
export class StartingScreenComponent {
    constructor(public dialog: MatDialog) { 
    }

    openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
        this.dialog.open(SignUpDialog, {
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
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
})
export class SignUpDialog {
    constructor(public dialogRef: MatDialogRef<SignUpDialog>) { }
   
    passwordHide: boolean = true
    confirmPasswordHide: boolean = true

    usernameFormControl = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)])

    passwordFormControl = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])

    confirmPasswordFormControl = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])
}

