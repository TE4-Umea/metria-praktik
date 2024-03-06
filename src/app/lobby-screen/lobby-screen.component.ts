import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'

@Component({
    selector: 'app-lobby-screen',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './lobby-screen.component.html',
    styleUrl: './lobby-screen.component.scss'
})
export class LobbyScreenComponent {
    playersReady: boolean = false

    startGame() {
        console.log('start')
    }

    cancelGame() {
        console.log('cancel')
    }
}
