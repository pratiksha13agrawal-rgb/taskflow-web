import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = "Something went wrong";

      switch(error.status) {
        case 400:
          message = error.error?.message ?? 'Invalid request';
          break;
        case 401:
          message = 'Invalid email or password';
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          router.navigate(['/auth/login']);
          break;
        case 403:
          message = 'Access denied';
          break;
        case 404:
          message = 'Resource not found';
          break;
        case 409:
          message = error.error?.message ?? 'Already exists';
          break;
        case 500:
          message = 'Server error. Please try again later';
          break;
        case 0:
          message = 'Cannot connect to server. Is backend running?';
          break;
        default:
          message = error.error?.message ?? 'Something went wrong';
      }
      return throwError(() => ({ ...error, userMessage: message }));
    })
  );
};
