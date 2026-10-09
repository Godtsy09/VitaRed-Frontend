import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header-user',
  styleUrl: './header-user.scss',
  templateUrl: './header-user.html',
})
export class HeaderUser {
  private readonly authService = inject(AuthService);

  protected readonly userName = this.authService.fullName;
  protected readonly userInitials = this.authService.initials;
  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly menuOpen = signal(false);

  protected toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  @HostListener('document:click')
  protected onDocumentClick(): void {
    this.menuOpen.set(false);
  }

  protected onLogout(): void {
    this.closeMenu();
    this.authService.logout();
  }

  protected getInitials(): string {
    return this.authService.initials();
  }
}
