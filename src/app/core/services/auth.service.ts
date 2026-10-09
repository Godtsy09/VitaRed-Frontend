import { inject, Injectable, PLATFORM_ID, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import {
  PublicUser,
  LoginResult,
  RegisterUserPayload,
  RegisterDoctorPayload,
  UserRole,
} from '../models';

const TOKEN_KEY = 'vitared_token';
const USER_KEY = 'vitared_user';

type SessionUser = PublicUser & { role: UserRole; doctorId?: number };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  private readonly tokenSignal = signal<string | null>(null);
  private readonly userSignal = signal<SessionUser | null>(null);
  private initialized = false;

  readonly user = this.userSignal.asReadonly();
  readonly role = computed(() => this.userSignal()?.role ?? null);
  readonly doctorId = computed(() => this.userSignal()?.doctorId ?? null);
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null && this.userSignal() !== null);
  readonly fullName = computed(() => {
    const u = this.userSignal();
    return u ? `${u.nombre} ${u.apellido}` : '';
  });
  readonly initials = computed(() => {
    const name = this.userSignal()?.nombre ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });

  initializeAuth(): void {
    if (this.initialized) return;
    this.initialized = true;

    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);

    this.tokenSignal.set(token);

    if (userRaw) {
      try {
        this.userSignal.set(JSON.parse(userRaw) as SessionUser);
      } catch {
        this.userSignal.set(null);
      }
    }
  }

  login(email: string, password: string): Observable<LoginResult> {
    return this.http
      .post<LoginResult>('/api/auth/login', { email, password })
      .pipe(tap((result) => this.saveSession(result)));
  }

  registerUser(payload: RegisterUserPayload): Observable<LoginResult> {
    return this.http
      .post<LoginResult>('/api/auth/register/user', payload)
      .pipe(tap((result) => this.saveSession(result)));
  }

  registerDoctor(payload: RegisterDoctorPayload): Observable<LoginResult> {
    return this.http
      .post<LoginResult>('/api/auth/register/doctor', payload)
      .pipe(tap((result) => this.saveSession(result)));
  }

  me(): Observable<SessionUser> {
    return this.http.get<SessionUser>('/api/auth/me');
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.router.navigate(['/login']);
  }

  private saveSession(result: LoginResult): void {
    this.tokenSignal.set(result.token);
    this.userSignal.set(result.user);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    }
  }
}
