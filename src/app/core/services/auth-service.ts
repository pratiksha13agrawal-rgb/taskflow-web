import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';


export interface LoginRequest  { email: string; password: string; }
export interface RegisterRequest {
  name: string; email: string; password: string;
}
export interface AuthResponse    {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    tokenType:   string;
    user: {
      id:     number;
      name:   string;
      email:  string;
      avatar: string;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<AuthResponse['data']['user'] | null>(null); 

  constructor() {
    const stored = localStorage.getItem('user');
    if(stored) this.currentUser.set(JSON.parse(stored));
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${environment.apiUrl}/auth/login`,data)
      .pipe(
        tap(res => {
          localStorage.setItem('access_token', res.data.accessToken);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          this.currentUser.set(res.data.user);
        })
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${environment.apiUrl}/auth/register`,data);
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
