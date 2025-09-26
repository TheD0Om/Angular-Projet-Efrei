import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { CreateGameDto, Game, UpdateGameDto } from '../models/game.model';

const LS_KEY = 'boardhub_games';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function loadFromStorage(): Game[] {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Game[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  // Seed de départ si rien en storage
  const seed: Game[] = [
    {
      id: uid(),
      title: 'Hades II',
      platform: 'PC',
      genre: 'Rogue-lite',
      releasedAt: '2024-05-06',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uid(),
      title: 'The Legend of Zelda: Tears of the Kingdom',
      platform: 'Switch',
      genre: 'Action-Adventure',
      releasedAt: '2023-05-12',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  localStorage.setItem(LS_KEY, JSON.stringify(seed));
  return seed;
}

function saveToStorage(games: Game[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(games));
}

@Injectable({ providedIn: 'root' })
export class AdminGamesStore {
  /** State local via signals */
  private readonly _games = signal<Game[]>(loadFromStorage());

  /** Lecture instantanée (synchro) */
  snapshot(): Game[] {
    return this._games();
  }

  /** Liste observable (simule un appel réseau) */
  list(): Observable<Game[]> {
    return of(this._games()).pipe(delay(150));
  }

  /** Création */
  create(dto: CreateGameDto): Observable<Game> {
    const now = new Date().toISOString();
    const game: Game = {
      id: uid(),
      title: dto.title.trim(),
      platform: dto.platform,
      genre: dto.genre.trim(),
      releasedAt: dto.releasedAt && dto.releasedAt !== '' ? dto.releasedAt : null,
      createdAt: now,
      updatedAt: now
    };
    const next = [...this._games(), game];
    this._games.set(next);
    saveToStorage(next);
    return of(game).pipe(delay(200));
  }

  /** Mise à jour */
  update(id: string, dto: UpdateGameDto): Observable<Game> {
    let updated!: Game;
    const next = this._games().map(g => {
      if (g.id !== id) return g;
      updated = {
        ...g,
        title: dto.title.trim(),
        platform: dto.platform,
        genre: dto.genre.trim(),
        releasedAt: dto.releasedAt && dto.releasedAt !== '' ? dto.releasedAt : null,
        updatedAt: new Date().toISOString()
      };
      return updated;
    });
    this._games.set(next);
    saveToStorage(next);
    return of(updated).pipe(delay(200));
  }

  /** Suppression */
  remove(id: string): Observable<void> {
    const next = this._games().filter(g => g.id !== id);
    this._games.set(next);
    saveToStorage(next);
    return of(void 0).pipe(delay(150));
  }

  /** Trouver un jeu par id (optionnel) */
  findById(id: string): Observable<Game | undefined> {
    return this.list().pipe(map(arr => arr.find(g => g.id === id)));
  }
}
