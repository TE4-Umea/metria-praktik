import { Component } from '@angular/core'
import { MapComponent } from '../map/map.component'
import { UserInterfaceComponent } from '../user-interface/user-interface.component'

@Component({
    selector: 'app-game',
    standalone: true,
    imports: [MapComponent, UserInterfaceComponent],
    templateUrl: './game.component.html',
    styleUrl: './game.component.scss'
})
export class GameComponent {

}
