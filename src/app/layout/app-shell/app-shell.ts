import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';

@Component({
  selector: 'app-app-shell',
  imports: [
    CommonModule,
    RouterOutlet,
    Sidebar,
    Header,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  standalone: true
})
export class AppShell {
  sidebarCollapsed = signal<boolean>(false);

  onToggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
