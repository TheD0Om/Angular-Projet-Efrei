// src/app/features/app/services/games.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Game, Platform } from '../models/game.model';

const STORAGE_GAMES_KEY = 'bh_games_seed';

const SEED: Game[] = [
  {
    id: 101,
    title: 'Elden Ring',
    description: 'Action-RPG dans un monde ouvert mystérieux.',
    platform: 'PC',
    price: 59.99,
    genre: 'Action RPG',
    releasedAt: '2022-02-25',
  },
  {
    id: 102,
    title: 'Spider-Man 2',
    description: 'Aventure super-héroïque pleine d’action.',
    platform: 'PlayStation',
    price: 69.99,
    genre: 'Action / Aventure',
    releasedAt: '2023-10-20',
  },
  {
    id: 103,
    title: 'Forza Horizon 5',
    description: 'Course en monde ouvert avec des centaines de voitures.',
    platform: 'Xbox',
    price: 49.99,
    genre: 'Course',
    releasedAt: '2021-11-09',
  },
  {
    id: 104,
    title: 'Zelda: Tears of the Kingdom',
    description: 'Épopée d’exploration et de créativité.',
    platform: 'Switch',
    price: 69.99,
    genre: 'Action / Aventure',
    releasedAt: '2023-05-12',
  },
  {
    id: 105,
    title: 'Baldur’s Gate 3',
    description: 'CRPG profond avec choix et conséquences.',
    platform: 'PC',
    price: 59.99,
    genre: 'RPG',
    releasedAt: '2023-08-03',
  },
];

@Injectable({ providedIn: 'root' })
export class GamesService {
  private _games = signal<Game[]>(this.loadInitial());
  readonly games$ = this._games.asReadonly();

  // --- persistence ---
  private loadInitial(): Game[] {
    const saved = localStorage.getItem(STORAGE_GAMES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Game[];
        return parsed?.length ? parsed : SEED;
      } catch {
        return SEED;
      }
    }
    localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(SEED));
    return SEED;
  }

  private persist(): void {
    localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(this._games()));
  }

  // --- API mock ---
  list(): Observable<Game[]> {
    return of(this._games()).pipe(delay(200));
  }

  getById(id: number): Observable<Game> {
    const found = this._games().find(g => g.id === id);
    if (!found) return throwError(() => new Error('Jeu introuvable'));
    return of(found).pipe(delay(150));
  }

  create(data: Omit<Game, 'id'>): Observable<Game> {
    const newGame: Game = { ...data, id: Date.now() };
    this._games.update(arr => [...arr, newGame]);
    this.persist();
    return of(newGame).pipe(delay(200));
  }

  update(id: number, changes: Partial<Omit<Game, 'id'>>): Observable<Game> {
    let updated: Game | undefined;
    this._games.update(arr =>
      arr.map(g => {
        if (g.id !== id) return g;
        updated = { ...g, ...changes };
        return updated!;
      })
    );
    if (!updated) return throwError(() => new Error('Jeu introuvable'));
    this.persist();
    return of(updated).pipe(delay(200));
  }

  delete(id: number): Observable<void> {
    const before = this._games().length;
    this._games.update(arr => arr.filter(g => g.id !== id));
    if (this._games().length === before) {
      return throwError(() => new Error('Jeu introuvable'));
    }
    this.persist();
    return of(void 0).pipe(delay(150));
  }

  resetSeed(): void {
    this._games.set(SEED);
    this.persist();
  }
}

export type { Game, Platform }; // optionnel: re-export pratique
