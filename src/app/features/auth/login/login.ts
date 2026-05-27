import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DividerModule,
    ToastModule,
    
  ],
  providers: [MessageService],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(MessageService);

  loading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remeberMe: [false]
  });

  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  onSubmit(): void {   
    if(this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService.login({ email: this.email.value!, password: this.password.value!})
      .subscribe({
        next : () => { 
          this.loading.set(false);
          this.toast.add({
             severity: 'success',
             summary:  'Welcome back!',
             detail:   `Good to see you again 👋`,
             life:     2000
           });
           setTimeout(() =>
            this.router.navigate(['/app/dashboard']), 500);
        }, error: (err) => {
          this.loading.set(false);
          this.toast.add({
            severity: 'error',
            summary: 'Login failed',
            detail: err?.error?.message ?? 'Invalid email or password',
            life:     4000            
          });
        }
      });
  }

  loginWithGoogle(): void {
    // OAuth — wire later
    console.log('Google login');
  }
}
