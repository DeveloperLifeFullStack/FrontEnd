import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { player } from '../pages/dashboard/pages/code-casino/code-casino';
interface requestData {
  language: string;
  experience: string;
}
interface choose {
  snippetId: string;
  selectedOption: string;
  pointsBet: string;
}
@Injectable({
  providedIn: 'root',
})
export class CodeCasinoServices {
  private requestSnippetUrl = 'https://localhost:44383/casino/generate';
  private casinoChooseUrl = 'https://localhost:44383/casino/choose';
  private leaderboardUrl = 'https://localhost:44383/casino/leaderboard';
  constructor(private httpClient: HttpClient) {}

  requestSnippet(requestData: requestData): Observable<any> {
    const rawToken = localStorage.getItem('token');
    const token = JSON.parse(rawToken || 'null');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.httpClient.post(this.requestSnippetUrl, requestData, {
      headers,
    });
  }
  chooseCorrect(requestData: choose): Observable<any> {
    const rawToken = localStorage.getItem('token');
    const token = JSON.parse(rawToken || 'null');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    return this.httpClient.post(this.casinoChooseUrl, requestData, { headers });
  }
  getLeaderboard(): Observable<player[]> {
    const rawToken = localStorage.getItem('token');
    const token = JSON.parse(rawToken || 'null');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    return this.httpClient.get<player[]>(this.leaderboardUrl, { headers });
  }
}
