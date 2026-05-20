import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { StepsModule } from 'primeng/steps';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth-service';

// Custom validator — password match
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password        = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ mismatch: true });
    return { mismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DividerModule,
    ToastModule,
    StepsModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  standalone: true,
  providers: [MessageService]
})
export class Register {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private toast  = inject(MessageService);

  loading  = signal(false);

  // Password strength
  passwordStrength = signal<'weak' | 'fair' | 'strong' | null>(null);

  form = this.fb.group({
    name:            ['', [Validators.required, Validators.minLength(2)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator });

  get name()            { return this.form.get('name')!; }
  get email()           { return this.form.get('email')!; }
  get password()        { return this.form.get('password')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  onPasswordInput(): void {
    const val = this.password.value ?? '';
    if (!val) { this.passwordStrength.set(null); return; }

    const hasUpper   = /[A-Z]/.test(val);
    const hasNumber  = /\d/.test(val);
    const hasSpecial = /[^a-zA-Z0-9]/.test(val);
    const long       = val.length >= 10;

    const score = [hasUpper, hasNumber, hasSpecial, long]
      .filter(Boolean).length;

    if (score <= 1) this.passwordStrength.set('weak');
    else if (score === 2 || score === 3) this.passwordStrength.set('fair');
    else this.passwordStrength.set('strong');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.auth.register({
      name:     this.name.value!,
      email:    this.email.value!,
      password: this.password.value!,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.add({
          severity: 'success',
          summary: 'Account created!',
          detail: 'Welcome to TaskFlow'
        });
        setTimeout(() => this.router.navigate(['/app/dashboard']), 800);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.add({
          severity: 'error',
          summary: 'Registration failed',
          detail: err?.error?.message ?? 'Something went wrong'
        });
      }
    });
  }

  registerWithGoogle(): void {
    console.log('Google register');
  }
}
