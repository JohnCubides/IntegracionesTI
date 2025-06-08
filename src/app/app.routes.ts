import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/itemDetails/item.detail.component').then(m => m.ItemDetailComponent)
  }  
];
