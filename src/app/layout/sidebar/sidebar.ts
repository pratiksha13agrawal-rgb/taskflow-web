import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { TooltipModule }   from 'primeng/tooltip';
import { BadgeModule }     from 'primeng/badge';
import { AvatarModule }    from 'primeng/avatar';
import { ThemeService } from '../../core/services/theme-service';
import { AuthService } from '../../core/services/auth-service';
import { NAV_ITEMS, NavItem } from '../../core/models/nav.model';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    TooltipModule,
    BadgeModule,
    AvatarModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  standalone: true
})
export class Sidebar {
  theme = inject(ThemeService);
  auth  = inject(AuthService);
  router = inject(Router);

  // Input from app-shell
  collapsed = input<boolean>(false);

  // Output to app-shell
  toggleCollapse = output<void>();

  navItems: NavItem[] = NAV_ITEMS;

  onToggle(): void {
    this.toggleCollapse.emit();
  }

  onLogout(): void {
    this.auth.logout();
  }

    navigate(route: string): void {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
  
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
