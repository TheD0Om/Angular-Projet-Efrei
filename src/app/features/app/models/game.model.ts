// src/app/features/app/models/game.model.ts
export type Platform = 'PC' | 'PlayStation' | 'Xbox' | 'Switch';

export interface Game {
  id: number;
  title: string;
  description?: string;
  platform: Platform;
  price: number;       // EUR
  genre: string;       // <= requis
  releasedAt?: string; // ISO string
}
