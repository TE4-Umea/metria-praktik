import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'

@Injectable({
    providedIn: 'root'
})
export class SignUpService {
    constructor(private http: HttpClient) { }

    signUp(username: string, password: string) {
        const headers = new HttpHeaders()
        headers.append('Content-Type', 'application/json')
        headers.append('Authorization', 'Basic ' + btoa(username + ':' + password))

        return this.http.post('http://jupiter.umea-ntig.se:4893/register_user', { headers })
    }
}
