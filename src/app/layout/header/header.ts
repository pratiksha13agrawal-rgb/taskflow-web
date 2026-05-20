import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth-service';
import { ThemeService } from '../../core/services/theme-service';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    BadgeModule,
    AvatarModule,
    TooltipModule,
    PopoverModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true
})
export class Header {
  auth  = inject(AuthService);
  theme = inject(ThemeService);

  // Receive sidebar collapsed state
  sidebarCollapsed = input<boolean>(false);

  searchQuery = '';

  notifications = [
    { id: 1, text: 'Task "Design login page" is due today',   time: '2m ago',  read: false },
    { id: 2, text: 'John assigned you a new task',            time: '1h ago',  read: false },
    { id: 3, text: 'Habit streak: 7 days! Keep it up 🔥',     time: '3h ago',  read: true  },
    { id: 4, text: 'Team meeting reminder at 3:00 PM',         time: '5h ago',  read: true  },
  ];

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAllRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  onSearch(): void {
    console.log('Search:', this.searchQuery);
  }
}
