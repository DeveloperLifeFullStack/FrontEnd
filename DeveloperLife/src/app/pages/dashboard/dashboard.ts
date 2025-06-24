import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Sidebar } from '../../services/sidebar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  isSidebarOpen = false;
  activeNavItem = 'home';
  constructor(private router: Router, public sideBarService: Sidebar) {
    // Check if sidebar should be open by default on desktop
  }

  setActiveNavItem(item: string): void {
    this.activeNavItem = item;
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      this.sideBarService.closeSidebar();
    }
  }

  logOut() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
