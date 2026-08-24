import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => localStorage.getItem('token') ? true : inject(Router).createUrlTree(['/login']);
export const guestGuard: CanActivateFn = () => localStorage.getItem('token') ? inject(Router).createUrlTree(['/feed']) : true;
