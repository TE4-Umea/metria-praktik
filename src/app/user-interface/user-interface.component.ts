import { Component, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MapComponent } from '../map/map.component'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { SetShowBuildings } from '../service'
import { DragScrollComponent, DragScrollItemDirective } from 'ngx-drag-scroll'

@Component({
    selector: 'app-user-interface',
    standalone: true,
    imports: [CommonModule, MapComponent, MatSlideToggleModule, DragScrollComponent, DragScrollItemDirective],
    templateUrl: './user-interface.component.html',
    styleUrl: './user-interface.component.scss'
})
export class UserInterfaceComponent implements OnInit {
    constructor(private setShowBuildings: SetShowBuildings) { }

    @ViewChild('carousel', { read: DragScrollComponent }) ds!: DragScrollComponent


    resources: { [resource: string]: number } = { Money: 0, Stone: 0, Wood: 0, Metal: 0, Food: 0, Electricity: 0, Oil: 0, People: 0, Weapons: 0 }

    information: { [info: string]: string | number } = { Weather: 'Sunny', Date: '2021-01-01', Round: 1, Level: 1 }

    showDropdown: boolean = false
    showMenu: boolean = false
    showBuildings: boolean = false

    ngOnInit() {
        this.setShowBuildings.showBuildings$.subscribe(show => {
            this.showBuildings = show
        })
    }

    toggleDropdown(): void {
        this.showDropdown = !this.showDropdown
    }

    toggleMenu(): void {
        this.showMenu = !this.showMenu
    }

    carouselLeft(): void {
        this.ds.moveLeft()
    }

    carouselRight(): void {
        this.ds.moveRight()
    }
}
