export interface Game {
  id: number;
  title: string;
  platform: 'PC' | 'PlayStation' | 'Xbox' | 'Switch' | 'Mobile' | 'Other';
  genre: string;
  releasedAt?: string; // ISO date
}
