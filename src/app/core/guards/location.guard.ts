import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { WeatherStore } from '../state/weather.store';

export const locationGuard: CanActivateFn = (route, state) => {
  const store = inject(WeatherStore);
  const router = inject(Router);

  if (store.selectedLocation()) {
    return true;
  }

  return router.parseUrl('/');
};
