import { Injectable, computed, signal } from '@angular/core';
import { Game, Platform } from '../models/game.model';
import { Observable, of, delay, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GamesService {
  private readonly _games = signal<Game[]>([
    {
      id: 101, title: 'Star Odyssey', platform: 'PC', price: 49.99, genre: 'Action-RPG',
      releasedAt: '2024-11-15',
      description: 'Explore une galaxie procédurale, améliore ton vaisseau et assemble ton équipage.',
    },
    {
      id: 102, title: 'Neo Street 5', platform: 'PS5', price: 69.99, genre: 'Combat',
      releasedAt: '2025-02-20',
      description: 'Affrontements nerveux en 60 fps avec netcode rollback et ligues en ligne.',
    },
    {
      id: 103, title: 'Kingdom Forge', platform: 'Switch', price: 59.99, genre: 'Stratégie',
      releasedAt: '2023-09-08',
      description: 'Construit, gère et défends ton royaume dans un RTS accessible et profond.',
    },
    {
      id: 104, title: 'Circuit Breakerz', platform: 'Xbox', price: 59.00, genre: 'Course',
      releasedAt: '2024-06-01',
      description: 'Courses arcade, drift et personnalisation poussée.',
    },
    {
      id: 105, title: 'Myst Isles', platform: 'PC', price: 39.00, genre: 'Aventure',
      releasedAt: '2022-12-12',
      description: 'Îles brumeuses, puzzles environnementaux et narration sans HUD.',
    },
  ]);

  readonly games$ = this._games.asReadonly();
  readonly platforms: Platform[] = ['PC', 'PS5', 'Xbox', 'Switch'];

  list(): Observable<Game[]> {
    // Simule un délai réseau
    return of(this._games()).pipe(delay(150));
  }

  getById(id: number): Observable<Game> {
    const g = this._games().find(x => x.id === id);
    if (!g) return throwError(() => new Error('Jeu introuvable'));
    return of(g).pipe(delay(120));
  }

  // pour plus tard (admin / achats) :
  add(game: Game): Observable<Game> {
    this._games.update(arr => [...arr, game]);
    return of(game).pipe(delay(100));
  }
}
