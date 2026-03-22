import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Account } from './account/account';
import { Auth } from './auth/auth';
import { ResetPassword } from './reset-password/reset-password';
import { UrgeAdvice } from './urge-advice/urge-advice';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'account', component: Account },
  { path: 'auth', component: Auth },
  { path: 'reset-password', component: ResetPassword },
  { path: 'urge-advice', component: UrgeAdvice },
];
