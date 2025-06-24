import { Component } from '@angular/core';
import { Sidebar } from '../../../../services/sidebar';
@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  constructor(public sideBarService: Sidebar) {}
}
