import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

type FeaturedGame = {
  id: number;
  title: string;
  platform: 'PC' | 'PS5' | 'Xbox' | 'Switch';
  price: number;
  cover?: string; // url d’image si tu veux plus tard
};

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-8">
      <!-- Header de page -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">
            Bonjour, {{ currentName() || 'Joueur' }} 👋
          </h1>
          <p class="text-gray-600">
            Bienvenue sur votre espace BoardHub.
          </p>
        </div>
        <div class="flex gap-2">
          <a
            routerLink="/app"
            class="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Rafraîchir
          </a>
          <a
            routerLink="/admin"
            *ngIf="isAdmin()"
            class="rounded-md bg-gray-900 text-white px-3 py-1.5 text-sm hover:bg-black/80"
          >
            Admin
          </a>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <button
          type="button"
          class="rounded-lg border px-4 py-3 text-left hover:shadow transition"
          (click)="openCatalogSoon()"
        >
          <div class="text-sm text-gray-500">Action rapide</div>
          <div class="font-medium">Parcourir le catalogue</div>
          <div class="text-xs text-gray-400 mt-1">Bientôt : filtres, recherche…</div>
        </button>

        <a
          routerLink="/app"
          class="rounded-lg border px-4 py-3 text-left hover:shadow transition"
        >
          <div class="text-sm text-gray-500">Action rapide</div>
          <div class="font-medium">Mes achats</div>
          <div class="text-xs text-gray-400 mt-1">Historique & factures (à venir)</div>
        </a>

        <a
          routerLink="/app"
          class="rounded-lg border px-4 py-3 text-left hover:shadow transition"
        >
          <div class="text-sm text-gray-500">Action rapide</div>
          <div class="font-medium">Mes favoris</div>
          <div class="text-xs text-gray-400 mt-1">Wishlist & recommandations</div>
        </a>
      </div>

      <!-- Liste de jeux mis en avant -->
      <h2 class="text-lg font-semibold mb-4">Jeux à la une</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @for (game of featuredGames; track game.id) {
          <div class="rounded-lg border p-4 hover:shadow-sm transition">
            <div class="flex items-start justify-between">
              <h3 class="font-medium">{{ game.title }}</h3>
              <span class="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                {{ game.platform }}
              </span>
            </div>
            <p class="mt-2 text-sm text-gray-600">
              Prix : {{ game.price | number:'1.2-2' }} €
            </p>

            <div class="mt-4 flex items-center gap-2">
              <button
                type="button"
                class="rounded bg-emerald-600 text-white px-3 py-1.5 text-sm hover:bg-emerald-700 transition"
                (click)="buySoon(game)"
              >
                Acheter
              </button>
              <button
                type="button"
                class="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 transition"
                (click)="toggleFav(game)"
              >
                {{ isFav(game.id) ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
              </button>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class UserHomeComponent {
  private readonly auth = inject(AuthService);

  readonly currentName = computed(() => this.auth.currentUser$()?.name ?? '');
  readonly isAdmin = this.auth.isAdmin;

  // Mini store local pour la page d’accueil (on branchera sur un vrai service ensuite)
  featuredGames: FeaturedGame[] = [
    { id: 101, title: 'Star Odyssey',  platform: 'PC',   price: 49.99 },
    { id: 102, title: 'Neo Street 5',  platform: 'PS5',  price: 69.99 },
    { id: 103, title: 'Kingdom Forge', platform: 'Switch', price: 59.99 },
  ];

  private favIds = new Set<number>();

  isFav(id: number): boolean {
    return this.favIds.has(id);
  }

  toggleFav(game: FeaturedGame) {
    if (this.favIds.has(game.id)) this.favIds.delete(game.id);
    else this.favIds.add(game.id);
  }

  buySoon(game: FeaturedGame) {
    // Placeholder achat — sera remplacé par le vrai flow d’achat
    alert(`Achat (mock) de "${game.title}" — prochaine étape : panier + paiement`);
  }

  openCatalogSoon() {
    alert('Bientôt : page catalogue avec recherche, filtres, pagination…');
  }
}
