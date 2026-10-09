import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Header } from '@components/headers/header/header';

@Component({
  imports: [Header, FormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  protected email = '';
  protected password = '';
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
    }
  }

  protected onLogin(): void {
    console.log('🔐 [Login] onLogin() called', { email: this.email, loading: this.loading() });
    if (this.loading()) return;
    if (!this.email || !this.password) {
      this.error.set('Por favor ingresa email y contraseña');
      return;
    }

    this.error.set('');
    this.loading.set(true);

    this.authService.login(this.email, this.password).subscribe({
      next: (result) => {
        console.log('✅ [Login] Success', result);
        this.loading.set(false);
        this.redirectByRole();
      },
      error: (err) => {
        console.error('❌ [Login] Error', err);
        this.loading.set(false);
        this.error.set(err?.error?.error ?? 'Credenciales inválidas. Inténtalo de nuevo.');
      },
    });
  }

  private redirectByRole(): void {
    const role = this.authService.role();
    if (role === 'doctor') {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/availableDoctors']);
    }
  }
}
