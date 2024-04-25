/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private cookieService: CookieService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean {
        const token = this.cookieService.get('token')
        if (!token) {
            this.router.navigate(['/'])
            return false
        }
        return true
    }

}