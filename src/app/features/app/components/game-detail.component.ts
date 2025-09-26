import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GamesService } from '../services/games.service';
import { Game } from '../models/game.model';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-8">
      <a routerLink="/app/catalog" class="text-sm text-gray-600 hover:underline">&larr; Retour au catalogue</a>

      @if (loading()) {
        <div class="mt-6">Chargement…</div>
      } @else if (error()) {
        <div class="mt-6 text-red-600">{{ error() }}</div>
      } @else if (game()) {
        <div class="mt-6 rounded-lg border p-6">
          <header class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">{{ game()!.title }}</h1>
              <p class="text-gray-600">{{ game()!.genre }} • {{ game()!.platform }} • {{ game()!.releasedAt | date:'longDate' }}</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold">{{ game()!.price | number:'1.2-2' }} €</div>
              <button
                type="button"
                class="mt-2 rounded bg-emerald-600 text-white px-4 py-2 text-sm hover:bg-emerald-700 transition"
                (click)="buy(game()!)"
              >
                Acheter
              </button>
            </div>
          </header>

          <p class="mt-6 text-gray-800 whitespace-pre-line">
            {{ game()!.description || 'Pas de description fournie.' }}
          </p>

          <div class="mt-8 flex items-center gap-3">
            <button
              type="button"
              class="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 transition"
              (click)="toggleFav(game()!)"
            >
              {{ isFav(game()!.id) ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
            </button>

            <a
              routerLink="/app"
              class="rounded bg-gray-900 text-white px-3 py-1.5 text-sm hover:bg-black/80 transition"
            >
              Aller à l’accueil
            </a>
          </div>
        </div>
      }
    </section>
  `,
})
export class GameDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly games = inject(GamesService);

  readonly game = signal<Game | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string>('');

  private favIds = new Set<number>();
  isFav = (id: number) => this.favIds.has(id);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Identifiant invalide');
      this.loading.set(false);
      return;
    }
    this.games.getById(id).subscribe({
      next: (g) => { this.game.set(g); this.loading.set(false); },
      error: (e) => { this.error.set(e.message || 'Jeu introuvable'); this.loading.set(false); }
    });
  }

  toggleFav(g: Game) {
    if (this.favIds.has(g.id)) this.favIds.delete(g.id);
    else this.favIds.add(g.id);
  }

  buy(g: Game) {
    alert(`Achat (mock) de "${g.title}" — prochaine étape : panier + paiement`);
    // plus tard: navigation vers /app/checkout, ajout au panier, etc.
  }
}
