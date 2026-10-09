import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header-doctor',
  styleUrl: './header-doctor.scss',
  templateUrl: './header-doctor.html',
})
export class HeaderDoctor {
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
