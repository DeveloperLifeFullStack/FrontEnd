import { Component, Inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from '../../services/sidebar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  isSidebarOpen = false;
  activeNavItem = 'home';

  constructor(private router: Router, public sideBarService: Sidebar) {
    if (this.activeNavItem === 'home') {
      this.router.navigate(['/dashboard/home']);
    }
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
    this.router.navigate(['/login']);
  }
}
