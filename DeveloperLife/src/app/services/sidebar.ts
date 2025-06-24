import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Sidebar {
  private isSidebarOpenSubject = new BehaviorSubject<boolean>(false);
  public isSidebarOpen$ = this.isSidebarOpenSubject.asObservable();

  constructor() {
    this.checkInitialScreenSize();
    this.setupResizeListener();
  }

  toggleSidebar(): void {
    this.isSidebarOpenSubject.next(!this.isSidebarOpenSubject.value);
  }
  closeSidebar(): void {
    this.isSidebarOpenSubject.next(false);
  }
  openSidebar(): void {
    this.isSidebarOpenSubject.next(true);
  }
  private checkInitialScreenSize(): void {
    if (typeof window !== 'undefined') {
      const isDesktop = window.innerWidth > 768;
      this.isSidebarOpenSubject.next(isDesktop);
    }
  }
  private setupResizeListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        const isDesktop = window.innerWidth > 768;
        this.isSidebarOpenSubject.next(isDesktop);
      });
    }
  }
}
