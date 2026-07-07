export interface MediaItem {
  id: number;
  title: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  media_type: 'movie' | 'tv';
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export interface WatchlistItem extends MediaItem {
  addedAt: string;
}

export interface HistoryItem extends MediaItem {
  watchedAt: string;
  progress: number;
  timestamp: number;
  season?: number;
  episode?: number;
}
