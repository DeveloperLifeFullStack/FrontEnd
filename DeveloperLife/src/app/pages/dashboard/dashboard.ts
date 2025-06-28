import { Component, Inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from '../../services/sidebar';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { Pipe } from '@angular/core';
import { pipe } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  isSidebarOpen = false;
  activeNavItem = 'home';
  userData: any;

  constructor(private router: Router, public sideBarService: Sidebar) {
    if (this.activeNavItem === 'home') {
      this.router.navigate(['/dashboard/home']);
    }
  }
  ngOnInit(): void {
    const localStorageData = JSON.parse(
      localStorage.getItem('userData') ?? 'null'
    );
    this.userData = localStorageData;
  }
  setActiveNavItem(item: string): void {
    this.activeNavItem = item;
    if (window.innerWidth <= 768) {
      this.sideBarService.closeSidebar();
    }
  }
  goToPage(name: string) {
    this.router.navigate([`/dashboard/${name}`]);
  }

  logOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }
}
