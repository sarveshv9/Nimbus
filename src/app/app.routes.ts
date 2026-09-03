import { Routes } from '@angular/router';
import { locationGuard } from './core/guards/location.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Nimbus — Weather',
  },
  {
    path: 'explore',
    loadComponent: () =>
      import('./features/explore/explore.component').then(m => m.ExploreComponent),
    title: 'Nimbus — Explore',
  },
  {
    path: 'forecast',
    loadComponent: () =>
      import('./features/forecast/forecast.component').then(m => m.ForecastComponent),
    title: 'Nimbus — Forecast',
    canActivate: [locationGuard],
  },
  {
    path: 'details',
    loadComponent: () =>
      import('./features/details/details.component').then(m => m.DetailsComponent),
    title: 'Nimbus — Details',
    canActivate: [locationGuard],
  },
  {
    path: 'locations',
    loadComponent: () =>
      import('./features/locations/locations.component').then(m => m.LocationsComponent),
    title: 'Nimbus — Saved Locations',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent),
    title: 'Nimbus — Settings',
  },
  { path: '**', redirectTo: '' },
];
