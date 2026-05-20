import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface LoginRequest  { email: string; password: string; }
export interface RegisterRequest {
  name: string; email: string; password: string;
}
export interface AuthResponse  {
  accessToken: string;
  user: { id: number; name: string; email: string; avatar?: string; };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<AuthResponse['user'] | null>(null); 

  constructor() {
    const stored = localStorage.getItem('user');
    if(stored) this.currentUser.set(JSON.parse(stored));
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    const mock: AuthResponse = {
      accessToken: 'mock-jwt-token-12345',
      user: { id: 1, name: 'Rahul Patel', email: data.email }
    };
    return new Observable(observer => {
      setTimeout(() => {
        localStorage.setItem('access_token', mock.accessToken);
        localStorage.setItem('user', JSON.stringify(mock.user));
        this.currentUser.set(mock.user);
        observer.next(mock);
        observer.complete();
      }, 800);
    });
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    const mock: AuthResponse = {
      accessToken: 'mock-jwt-token-12345',
      user: { id: 1, name: data.name, email: data.email }
    };
    return new Observable(observer => {
      setTimeout(() => {
        localStorage.setItem('access_token', mock.accessToken);
        localStorage.setItem('user', JSON.stringify(mock.user));
        this.currentUser.set(mock.user);
        observer.next(mock);
        observer.complete();
      }, 800);
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}
