import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BugChaseService {
  private getLeaderboardUrl = 'https://localhost:44383/bugchase/leaderboard';
  private getHighScoreUrl = 'https://localhost:44383/bugchase/highscore';
  private submitHighScoreUrl = 'https://localhost:44383/bugchase/submit';
  constructor(private httpClient: HttpClient) {}

  getLeaderboard(): Observable<any> {
    const rawToken = localStorage.getItem('token');
    const token = JSON.parse(rawToken || 'null');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.httpClient.get(this.getLeaderboardUrl, { headers });
  }
  getHighScore(): Observable<any> {
    const rawToken = localStorage.getItem('token');
    const token = JSON.parse(rawToken || 'null');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.httpClient.get(this.getHighScoreUrl, { headers });
  }
  submitScore(score: number): Observable<any> {
    const rawToken = localStorage.getItem('token');
    const token = JSON.parse(rawToken || 'null');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const body = { highScore: score };
    return this.httpClient.post(this.submitHighScoreUrl, body, { headers });
  }
}
