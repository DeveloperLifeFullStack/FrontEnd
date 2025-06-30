import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatingAppService {
  private postProfileUrl = 'https://localhost:44383/dating/profile';
  private datingAIChatUrl = 'https://localhost:44383/dating/ai/chat';
  constructor(private httpClient: HttpClient) {}

  createProfile(profile: any): Observable<any> {
    const rawToken = localStorage.getItem('token');
    const token = JSON.parse(rawToken || 'null');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    return this.httpClient.post(this.postProfileUrl, profile, { headers });
  }

  chatAI(message: any): Observable<any> {
    const rawToken = localStorage.getItem('token');
    const token = JSON.parse(rawToken || 'null');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    return this.httpClient.post(this.datingAIChatUrl, message, { headers });
  }
}
