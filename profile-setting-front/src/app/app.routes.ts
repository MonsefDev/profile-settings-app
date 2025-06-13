import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/profile',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Profile Management'
  },
  {
    path: 'settings',
    children: [
      {
        path: '',
        redirectTo: 'scopes',
        pathMatch: 'full'
      },
      {
        path: 'scopes',
        loadComponent: () => import('./features/settings/scopes/scopes.component').then(m => m.ScopesComponent),
        title: 'Scopes Management'
      },
      {
        path: 'partners',
        loadComponent: () => import('./features/settings/partners/partners.component').then(m => m.PartnersComponent),
        title: 'Partners Management'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/profile'
  }
];