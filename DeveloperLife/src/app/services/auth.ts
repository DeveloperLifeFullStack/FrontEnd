import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface RegistrationRequest {
  username: string;
  name: string;
  surname: string;
  dateOfBirth: string;
  stack: string;
  experience: string;
}
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private logInUrl = 'https://localhost:44383/auth/auth/login';
  private registerUrl = 'https://localhost:44383/auth/auth/register';
  constructor(private httpClient: HttpClient) {}

  login(loginData: { username: string }): Observable<any> {
    return this.httpClient.post(this.logInUrl, loginData);
  }
  register(registerData: any): Observable<any> {
    return this.httpClient.post(this.registerUrl, registerData);
  }
}
