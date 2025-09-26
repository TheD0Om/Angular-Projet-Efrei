export type Platform = 'PC' | 'PS5' | 'Xbox' | 'Switch';

export interface Game {
  id: string;
  title: string;
  platform: Platform;
  genre: string;
  /**
   * Stocké au format 'YYYY-MM-DD' (ou null) pour matcher l'<input type="date">
   */
  releasedAt: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface CreateGameDto {
  title: string;
  platform: Platform;
  genre: string;
  releasedAt: string | null; // 'YYYY-MM-DD' | null
}

export interface UpdateGameDto {
  title: string;
  platform: Platform;
  genre: string;
  releasedAt: string | null;
}
