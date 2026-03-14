import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: 'wallet',
        loadChildren: () => import('./features/wallet/wallet.routes').then(m => m.walletRoutes),
        canActivate: [authGuard]
    },
    {
        path: '',
        redirectTo: '/wallet/dashboard',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/wallet/dashboard'
    }
];
