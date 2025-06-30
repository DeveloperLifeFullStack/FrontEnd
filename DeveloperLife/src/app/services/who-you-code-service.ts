import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
interface SubmitCodeInterface {
  owner: string;
  repo: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class WhoYouCodeService {
  private submitCodeAnalyzeURl = 'https://localhost:44383/personality/analyze';
  constructor(private httpClient: HttpClient) {}

  submitCode(data: SubmitCodeInterface): Observable<any> {
    const rawToken = localStorage.getItem('token');
    const token = JSON.parse(rawToken || 'null');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.httpClient.post(this.submitCodeAnalyzeURl, data, { headers });
  }
}
