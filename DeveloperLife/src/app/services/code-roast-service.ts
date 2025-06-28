import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface taskData {
  language: string;
  difficulty: string;
}
@Injectable({
  providedIn: 'root',
})
export class CodeRoastService {
  private getTaskUrl = 'https://localhost:44383/roaster/get-task';
  private getRoastUrl = 'https://localhost:44383/roaster/submit-code';
  constructor(private httpClient: HttpClient) {}

  getTask(taskData: taskData): Observable<any> {
    const rawToken = localStorage.getItem('token');
    const token = JSON.parse(rawToken || 'null');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const params = new HttpParams()
      .set('language', taskData.language)
      .set('difficulty', taskData.difficulty);
    return this.httpClient.get(this.getTaskUrl, { headers, params });
  }
  submitCode(code: string): Observable<any> {
    const rawToken = localStorage.getItem('token');
    const token = JSON.parse(rawToken || 'null');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    return this.httpClient.post(this.getRoastUrl, {code}, { headers });
  }
}
