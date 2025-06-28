import { Component, OnInit } from '@angular/core';
import { Sidebar } from '../../../../services/sidebar';
import { UserDataService } from '../../../../services/user-data-service';
import { CommonModule, JsonPipe } from '@angular/common';
@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  userData: any | null = null;

  constructor(
    public sideBarService: Sidebar,
    private userDataService: UserDataService
  ) {}

  ngOnInit() {
    const storeData = localStorage.getItem('userData');
    if (storeData && storeData !== '{}') {
      this.userData = JSON.parse(storeData);
      console.log(this.userData);
    }
  }
}
