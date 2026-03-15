import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private apiUrl = 'http://localhost:3000/api/auth';


  constructor(private http: HttpClient) {}

  signUp(userData: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData).pipe(
      map((res: any) => res.user)
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      map((res: any) => res.token)
    );
  }
}
