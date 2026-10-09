import { Routes } from '@angular/router';
import { AvailableDoctors } from './views/user/available-doctors/available-doctors';
import { MyAppointments } from './views/user/my-appointments/my-appointments';
import { ScheduledAppointments } from './views/doctor/scheduled-appointments/scheduled-appointments';
import { Profile } from './views/doctor/profile/profile';
import { Login } from './views/auth/login/login';
import { Register } from './views/auth/register/register';
import { BookAppointment } from './views/user/book-appointment/book-appointment';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: 'login', component: Login },
  { path: 'register', component: Register },

  // User (Paciente) routes
  {
    path: 'availableDoctors',
    component: AvailableDoctors,
    canActivate: [roleGuard(['user'])],
  },
  {
    path: 'bookAppointment',
    component: BookAppointment,
    canActivate: [roleGuard(['user'])],
  },
  {
    path: 'myAppointments',
    component: MyAppointments,
    canActivate: [roleGuard(['user'])],
  },

  // Doctor routes
  {
    path: 'profile',
    component: Profile,
    canActivate: [roleGuard(['doctor'])],
  },
  {
    path: 'scheduledAppointments',
    component: ScheduledAppointments,
    canActivate: [roleGuard(['doctor'])],
  },

{ path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];