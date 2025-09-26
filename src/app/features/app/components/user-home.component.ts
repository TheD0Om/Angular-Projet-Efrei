import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

type FeaturedGame = {
  id: string;
  title: string;
  platform: 'PC' | 'PlayStation' | 'Xbox' | 'Switch';
  price: number;
  cover?: string;
};

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-8">
      <!-- Header perso -->
      <section class="mb-8">
        <h1 class="text-2xl md:text-3xl font-semibold text-gray-900">
          Bonjour {{ displayName() }} 👋
        </h1>
        <p class="text-gray-600 mt-1">
          Bienvenue sur votre espace BoardHub. Parcourez les jeux et préparez vos achats.
        </p>
      </section>

      <!-- Actions rapides -->
      <section class="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a routerLink="/app"
           class="rounded-lg border p-4 hover:shadow transition bg-white">
          <div class="text-sm text-gray-500">Mon espace</div>
          <div class="text-lg font-semibold">Accueil</div>
          <p class="text-sm text-gray-500 mt-1">Résumé, jeux en vedette</p>
        </a>

        <a routerLink="/app/shop"
           class="rounded-lg border p-4 hover:shadow transition bg-white">
          <div class="text-sm text-gray-500">Boutique</div>
          <div class="text-lg font-semibold">Acheter des jeux</div>
          <p class="text-sm text-gray-500 mt-1">À venir</p>
        </a>

        <a routerLink="/app/purchases"
           class="rounded-lg border p-4 hover:shadow transition bg-white">
          <div class="text-sm text-gray-500">Mes achats</div>
          <div class="text-lg font-semibold">Historique</div>
          <p class="text-sm text-gray-500 mt-1">À venir</p>
        </a>
      </section>

      <!-- Jeux en vedette (mock) -->
      <section>
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Jeux en vedette</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (game of featured(); track game.id) {
            <div class="rounded-lg border bg-white p-4 flex flex-col">
              <div class="aspect-video bg-gray-100 mb-3 rounded overflow-hidden flex items-center justify-center">
                <span class="text-gray-400 text-sm">Couverture</span>
              </div>

              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">{{ game.title }}</h3>
                <p class="text-sm text-gray-500 mt-1">
                  Plateforme : {{ game.platform }}
                </p>
              </div>

              <div class="mt-4 flex items-center justify-between">
                <span class="font-semibold">{{ game.price | currency:'EUR':'symbol':'1.2-2' }}</span>
                <button
                  type="button"
                  class="rounded bg-emerald-600 text-white px-3 py-1.5 text-sm hover:bg-emerald-700 transition disabled:opacity-60"
                  disabled
                  aria-disabled="true"
                  title="Disponible bientôt"
                >
                  Acheter
                </button>
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
})
export class UserHomeComponent {
  private readonly auth = inject(AuthService);

  readonly displayName = computed(() => {
    const u = this.auth.getCurrentUser();
    return u?.name || u?.email || 'Utilisateur';
    // si jamais name est vide, on retombe sur l’email
  });

  // Mock “en vedette” (on branchera sur de vraies données plus tard)
  readonly featured = computed<FeaturedGame[]>(() => [
    { id: 'g1', title: 'Elden Ring', platform: 'PC', price: 59.99 },
    { id: 'g2', title: 'Horizon Forbidden West', platform: 'PlayStation', price: 69.99 },
    { id: 'g3', title: 'Forza Horizon 5', platform: 'Xbox', price: 49.99 },
  ]);
}
