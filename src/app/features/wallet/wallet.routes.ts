import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';

export const walletRoutes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];