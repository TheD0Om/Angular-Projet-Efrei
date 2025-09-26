export type Platform = 'PC' | 'PS5' | 'Xbox' | 'Switch';

export interface Game {
  id: number;
  title: string;
  platform: Platform;
  price: number;
  genre: string;
  releasedAt: string;     // ISO date
  description?: string;
  cover?: string;         // URL optionnelle
}
