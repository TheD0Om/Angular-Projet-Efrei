import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { GamesService } from '../services/games.service';
import { Game, Platform } from '../models/game.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6">
      <h1 class="text-2xl font-bold mb-4">Catalogue des jeux</h1>

      <!-- Filtres -->
      <div class="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
        <div class="flex-1">
          <input
            class="w-full border rounded px-3 py-2"
            type="text"
            placeholder="Rechercher un jeu…"
            (input)="onQuery($event)"
          />
        </div>

        <div class="flex gap-3">
          <select class="border rounded px-3 py-2" (change)="onPlatform($event)">
            <option value="all">Toutes plateformes</option>
            <option value="PC">PC</option>
            <option value="PlayStation">PlayStation</option>
            <option value="Xbox">Xbox</option>
            <option value="Switch">Switch</option>
          </select>

          <select class="border rounded px-3 py-2" (change)="onSort($event)">
            <option value="title">Trier par titre</option>
            <option value="price-asc">Prix ↑</option>
            <option value="price-desc">Prix ↓</option>
          </select>
        </div>
      </div>

      <!-- Liste -->
      @if (loading()) {
        <p class="text-gray-500">Chargement…</p>
      } @else {
        @if (filtered().length === 0) {
          <p class="text-gray-500">Aucun jeu ne correspond à votre recherche.</p>
        } @else {
          <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            @for (g of filtered(); track g.id) {
              <div class="border rounded-lg p-4 bg-white shadow-sm">
                <div class="flex items-start justify-between mb-2">
                  <h2 class="font-semibold">{{ g.title }}</h2>
                  <span class="text-xs rounded px-2 py-0.5 bg-gray-100 text-gray-700">{{ g.platform }}</span>
                </div>

                @if (g.description) {
                  <p class="text-sm text-gray-600 mb-3 line-clamp-3">{{ g.description }}</p>
                }

                <div class="flex items-center justify-between">
                  <span class="font-semibold">{{ g.price | number:'1.2-2' }} €</span>
                  <a
                    class="text-sm text-blue-600 hover:underline"
                    [routerLink]="['/app/games', g.id]"
                    >Détails</a>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class CatalogComponent {
  private readonly games = inject(GamesService);

  // UI state
  readonly query = signal<string>('');
  readonly platform = signal<Platform | 'all'>('all');
  readonly sort = signal<'title' | 'price-asc' | 'price-desc'>('title');
  readonly loading = signal<boolean>(true);

  // Data
  readonly all = signal<Game[]>([]);

  constructor() {
    // charge (mock) puis met fin au loading
    this.games.list().subscribe({
      next: (arr) => {
        this.all.set(arr);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // Vue filtrée + triée
  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    const plat = this.platform();
    const sort = this.sort();

    let list = this.all();

    if (q) {
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          (g.description ?? '').toLowerCase().includes(q) ||
          (g.genre ?? '').toLowerCase().includes(q)
      );
    }

    if (plat !== 'all') {
      list = list.filter((g) => g.platform === plat);
    }

    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      default:
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  });

  // Handlers d’inputs — évitent les expressions complexes dans le template
  onQuery(ev: Event) {
    const value = (ev.target as HTMLInputElement | null)?.value ?? '';
    this.query.set(value);
  }

  onPlatform(ev: Event) {
    const value = (ev.target as HTMLSelectElement | null)?.value as Platform | 'all';
    this.platform.set(value);
  }

  onSort(ev: Event) {
    const value = (ev.target as HTMLSelectElement | null)?.value as 'title' | 'price-asc' | 'price-desc';
    this.sort.set(value);
  }
}
