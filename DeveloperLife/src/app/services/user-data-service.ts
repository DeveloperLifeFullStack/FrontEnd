import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface UserData {
  message: string;
  token: string;
  user: {
    id: number;
    firstName: string;
    zodiac: string;
    emoji: string;
    points: number;
  };
  zodiacInfo: {
    prediction: string;
    codingTip: string;
    luckyTechnology: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  constructor() {}
  private userDataSubject = new BehaviorSubject<UserData | null>(null);

  public userData$ = this.userDataSubject.asObservable();

  setUserData(data: UserData) {
    this.userDataSubject.next(data);
    localStorage.setItem('userData', JSON.stringify(data));
  }
  getUserData(): UserData | null {
    return this.userDataSubject.value;
  }
}
