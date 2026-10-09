import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header-user',
  styleUrl: './header-user.scss',
  templateUrl: './header-user.html',
})
export class HeaderUser {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly userName = this.authService.fullName;
  protected readonly userInitials = this.authService.initials;
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  protected onLogout(): void {
    this.authService.logout();
  }

  protected getInitials(): string {
    return this.authService.initials();
  }
}
