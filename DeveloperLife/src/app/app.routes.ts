import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { loginGuard } from './guards/login-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // { path: 'login', component: Login, canActivate: [loginGuard] },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((c) => c.Login),
    canActivate: [loginGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then((c) => c.Register),
    canActivate: [loginGuard],
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((c) => c.Dashboard),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/dashboard/pages/home/home').then((c) => c.Home),
      },
      {
        path: 'code-casino',
        loadComponent: () =>
          import('./pages/dashboard/pages/code-casino/code-casino').then(
            (c) => c.CodeCasino
          ),
      },
      {
        path: 'code-roast',
        loadComponent: () =>
          import('./pages/dashboard/pages/code-roast/code-roast').then(
            (c) => c.CodeRoast
          ),
      },
      {
        path: 'bug-chase',
        loadComponent: () =>
          import('./pages/dashboard/pages/bug-chase/bug-chase').then(
            (c) => c.BugChase
          ),
      },
      {
        path: 'who-you-code',
        loadComponent: () =>
          import('./pages/dashboard/pages/who-you-code/who-you-code').then(
            (c) => c.WhoYouCode
          ),
      },
      {
        path: 'dev-dating-room',
        loadComponent: () =>
          import(
            './pages/dashboard/pages/dev-dating-room/dev-dating-room'
          ).then((c) => c.DevDatingRoom),
      },
      {
        path: 'escape-meeting',
        loadComponent: () =>
          import('./pages/dashboard/pages/escape-meeting/escape-meeting').then(
            (c) => c.EscapeMeeting
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
