import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';


export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: 'app/dashboard',
    pathMatch: 'full'
  },

  // Auth routes (no shell)
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth-layout/auth-layout')
        .then(m => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login')
            .then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register')
            .then(m => m.Register)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // App routes (with shell — sidebar + header)
  {
    path: 'app',
    loadComponent: () =>
      import('./layout/app-shell/app-shell')
        .then(m => m.AppShell),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
      {
        path: 'tasks/today',
        loadComponent: () =>
          import('./features/tasks/today-tasks/today-tasks')
            .then(m => m.TodayTasks)
      },
      {
        path: 'tasks/completed',
        loadComponent: () =>
          import('./features/tasks/completed-tasks/completed-tasks')
            .then(m => m.CompletedTasks)
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/calendar/calendar')
            .then(m => m.Calendar)
      },
      {
        path: 'notes',
        loadComponent: () =>
          import('./features/notes/notes')
            .then(m => m.Notes)
      },
      {
        path: 'habits',
        loadComponent: () =>
          import('./features/habits/habits')
            .then(m => m.Habits)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile')
            .then(m => m.Profile)
      },
      {
        path: 'team',
        loadComponent: () =>
          import('./features/team/team')
            .then(m => m.Team)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Wildcard
  {
    path: '**',
    redirectTo: 'app/dashboard'
  }
];