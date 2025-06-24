import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const loginGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');
  if (token) {
    const router = inject(Router);
    return router.createUrlTree(['/dashboard']);
  }
  return true;
};
