import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';

import { AppLayout } from './layout/app-layout/app-layout';

import { Feed } from './features/feed/feed/feed';
import { Explore } from './features/explore/explore/explore';
import { Profile } from './features/profile/profile/profile';
import { Messages } from './features/messages/messages/messages';
import { Settings } from './features/settings/settings';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard],
  },

  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'feed',
        component: Feed,
      },
      {
        path: 'explore',
        component: Explore,
      },
      {
        path: 'messages',
        component: Messages,
      },
      {
        path: 'profile',
        component: Profile,
      },
      {
        path: 'profile/:id',
        component: Profile,
      },
      {
        path: 'settings',
        component: Settings,
      },
      {
        path: '',
        redirectTo: 'feed',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'feed',
  },
];
