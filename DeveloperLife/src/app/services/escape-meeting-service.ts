import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface reasonData {
  category: string;
  type: string;
}
@Injectable({
  providedIn: 'root',
})
export class EscapeMeetingService {
  private getReasonUrl = 'https://localhost:44383/generate-excuse';
  constructor(private httpClient: HttpClient) {}

  getReason(data: reasonData): Observable<any> {
    const rawToken = localStorage.getItem('token');
    const token = JSON.parse(rawToken || 'null');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const requestBody = {
      category: data.category,
      type: data.type,
    };
    return this.httpClient.post(this.getReasonUrl, requestBody, { headers });
  }
}
