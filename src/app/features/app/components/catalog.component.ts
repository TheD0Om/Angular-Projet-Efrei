import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GamesService } from '../services/games.service';
import { Game, Platform } from '../models/game.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-8">
      <div class="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Catalogue</h1>
          <p class="text-gray-600">Parcourez les jeux et cliquez pour voir les détails.</p>
        </div>

        <div class="flex items-center gap-2">
          <input
            type="text"
            class="rounded-md border px-3 py-2 text-sm"
            placeholder="Rechercher un titre…"
            [value]="query()"
            (input)="query.set(($event.target as HTMLInputElement).value)"
          />

          <select
            class="rounded-md border px-3 py-2 text-sm"
            [value]="platform()"
            (change)="platform.set(($event.target as HTMLSelectElement).value as Platform | 'all')"
          >
            <option value="all">Toutes plateformes</option>
            @for (p of platforms; track p) {
              <option [value]="p">{{ p }}</option>
            }
          </select>

          <select
            class="rounded-md border px-3 py-2 text-sm"
            [value]="sort()"
            (change)="sort.set(($event.target as HTMLSelectElement).value as 'price-asc' | 'price-desc' | 'title')"
          >
            <option value="title">Trier: Titre</option>
            <option value="price-asc">Prix: croissant</option>
            <option value="price-desc">Prix: décroissant</option>
          </select>
        </div>
      </div>

      <!-- Liste -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @for (g of filteredAndSorted(); track g.id) {
          <article class="rounded-lg border p-4 hover:shadow-sm transition flex flex-col">
            <div class="flex items-start justify-between">
              <h3 class="font-medium">{{ g.title }}</h3>
              <span class="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">{{ g.platform }}</span>
            </div>

            <p class="text-sm text-gray-500 mt-1">{{ g.genre }} • {{ g.releasedAt | date:'yyyy' }}</p>
            <p class="mt-2 text-gray-700 line-clamp-3">{{ g.description || '—' }}</p>

            <div class="mt-auto pt-4 flex items-center justify-between">
              <span class="font-semibold">{{ g.price | number:'1.2-2' }} €</span>
              <a
                [routerLink]="['/app', 'game', g.id]"
                class="rounded bg-gray-900 text-white px-3 py-1.5 text-sm hover:bg-black/80 transition"
              >
                Détails
              </a>
            </div>
          </article>
        }
      </div>

      @if (filteredAndSorted().length === 0) {
        <p class="text-gray-500 mt-8">Aucun jeu ne correspond à vos filtres.</p>
      }
    </section>
  `,
})
export class CatalogComponent {
  private readonly games = inject(GamesService);

  readonly platforms = this.games.platforms;

  // états UI
  readonly query = signal('');
  readonly platform = signal<Platform | 'all'>('all');
  readonly sort = signal<'price-asc' | 'price-desc' | 'title'>('title');

  // cache local des jeux
  readonly all = signal<Game[]>([]);

  constructor() {
    // charge les jeux
    this.games.list().subscribe(g => this.all.set(g));
  }

  readonly filteredAndSorted = computed(() => {
    let data = this.all();

    // filtre titre
    const q = this.query().trim().toLowerCase();
    if (q) data = data.filter(d => d.title.toLowerCase().includes(q));

    // filtre plateforme
    const p = this.platform();
    if (p !== 'all') data = data.filter(d => d.platform === p);

    // tri
    switch (this.sort()) {
      case 'price-asc':  data = [...data].sort((a, b) => a.price - b.price); break;
      case 'price-desc': data = [...data].sort((a, b) => b.price - a.price); break;
      default:           data = [...data].sort((a, b) => a.title.localeCompare(b.title));
    }

    return data;
  });
}
