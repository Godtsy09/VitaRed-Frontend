import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => () => {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.role();

  if (!authService.isAuthenticated() || !role) {
    return router.createUrlTree(['/login']);
  }

  if (!allowedRoles.includes(role)) {
    return router.createUrlTree(['/login'], {
      queryParams: {
        mensaje: 'No tienes permisos para acceder a esta vista con tu rol actual.',
      },
    });
  }

  return true;
};
