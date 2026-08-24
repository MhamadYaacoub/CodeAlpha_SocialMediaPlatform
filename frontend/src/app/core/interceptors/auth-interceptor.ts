import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    return next(req);
  }

  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRequest = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');
      if (error.status === 401 && !isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        void router.navigate(['/login'], {
          queryParams: { session: 'expired' },
        });
      }
      return throwError(() => error);
    }),
  );
};
