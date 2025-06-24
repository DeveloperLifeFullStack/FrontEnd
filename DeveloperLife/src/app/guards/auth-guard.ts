import { CanActivateFn, Router } from '@angular/router';
import { inject, Injectable } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  const router = inject(Router);
  return router.createUrlTree(['/login']);
};
