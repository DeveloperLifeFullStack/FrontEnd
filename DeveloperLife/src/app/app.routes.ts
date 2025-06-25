import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { authGuard } from './guards/auth-guard';
import { loginGuard } from './guards/login-guard';
import { Dashboard } from './pages/dashboard/dashboard';
import { Home } from './pages/dashboard/pages/home/home';
import { CodeCasino } from './pages/dashboard/pages/code-casino/code-casino';
import { CodeRoast } from './pages/dashboard/pages/code-roast/code-roast';
import { BugChase } from './pages/dashboard/pages/bug-chase/bug-chase';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login, canActivate: [loginGuard] },
  { path: 'register', component: Register, canActivate: [loginGuard] },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'code-casino', component: CodeCasino },
      { path: 'code-roast', component: CodeRoast },
      { path: 'bug-chase', component: BugChase },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
