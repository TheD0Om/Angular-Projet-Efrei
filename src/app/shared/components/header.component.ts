import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="w-full bg-gray-900 text-white">
      <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2">
          <span class="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
          <span class="font-semibold tracking-wide">BoardHub</span>
        </a>

        <nav class="flex items-center gap-4">
          @if (isLoggedIn()) {
            @if (isAdmin()) {
              <a
                routerLink="/admin"
                routerLinkActive="underline underline-offset-4"
                class="hover:underline underline-offset-4"
                >Admin</a>
            }

            <span class="text-sm text-gray-300 select-none">
              {{ currentEmail() }}
            </span>

            <button
              type="button"
              (click)="logout()"
              class="rounded bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20 transition"
              aria-label="Se déconnecter"
            >
              Logout
            </button>
          } @else {
            <a routerLink="/auth/login" routerLinkActive="underline underline-offset-4" class="hover:underline underline-offset-4">Login</a>
            <a routerLink="/auth/register" routerLinkActive="underline underline-offset-4" class="hover:underline underline-offset-4">Register</a>
          }
        </nav>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // on lit directement les signals exposés par le service
  readonly isLoggedIn   = computed(() => !!this.auth.currentUser$());
  readonly isAdmin      = this.auth.isAdmin; // computed déjà dans le service
  readonly currentEmail = computed(() => this.auth.currentUser$()?.email ?? '');

  async logout(): Promise<void> {
    this.auth.logout();
    await this.router.navigate(['/auth/login']);
  }
}
