import { Injectable, effect, signal } from '@angular/core';
import { Game } from '../models/game.model';
import { Observable, of, delay } from 'rxjs';

const STORAGE_GAMES_KEY = 'bh_games';

@Injectable({ providedIn: 'root' })
export class GameStoreService {
  private _games = signal<Game[]>([]);

  constructor() {
    const saved = localStorage.getItem(STORAGE_GAMES_KEY);
    this._games.set(saved ? JSON.parse(saved) : [
      { id: 1001, title: 'Elden Ring', platform: 'PC', genre: 'RPG', releasedAt: '2022-02-25' },
      { id: 1002, title: 'Zelda: TotK', platform: 'Switch', genre: 'Adventure', releasedAt: '2023-05-12' },
    ]);

    effect(() => {
      localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(this._games()));
    });
  }

  list(): Observable<Game[]> {
    return of(this._games()).pipe(delay(150));
  }

  create(data: Omit<Game, 'id'>): Observable<Game> {
    const g: Game = { id: Date.now(), ...data };
    this._games.update(gs => [...gs, g]);
    return of(g).pipe(delay(150));
  }

  update(id: number, updates: Partial<Omit<Game, 'id'>>): Observable<Game> {
    let updated: Game | undefined;
    this._games.update(gs => gs.map(g => {
      if (g.id !== id) return g;
      updated = { ...g, ...updates };
      return updated!;
    }));
    return of(updated!).pipe(delay(150));
  }

  delete(id: number): Observable<void> {
    this._games.update(gs => gs.filter(g => g.id !== id));
    return of(void 0).pipe(delay(150));
  }
}
