import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
    selector: 'app-user-interface',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './user-interface.component.html',
    styleUrl: './user-interface.component.scss'
})
export class UserInterfaceComponent {
    money: number = 0
    stone: number = 0
    wood: number = 0
    food: number = 0
    electricity: number = 0
    oil: number = 0
    people: number = 0
    weapons: number = 0

    weather: string = 'Sunny'
    date: string = '2021-01-01'
    round: number = 1
    level: number = 1

    showDropdown: boolean = false
    showMenu: boolean = false

    toggleDropdown(): void {
        this.showDropdown = !this.showDropdown 
    }  

    toggleMenu(): void {
        this.showMenu = !this.showMenu
    }  
}
