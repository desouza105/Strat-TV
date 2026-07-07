/// <reference types="vite/client" />
import { MediaItem } from '../types/media';

export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
export const POSTER_SIZE = 'w500';
export const BACKDROP_SIZE = 'w1280';
export const SMALL_POSTER_SIZE = 'w185';

const fetchFromAPI = async (endpoint: string, params: Record<string, string> = {}) => {
  const queryParams = new URLSearchParams({
    language: 'fr-FR',
    endpoint: endpoint,
    ...params,
  });

  const response = await fetch(`/api/tmdb?${queryParams}`, {
    headers: {
      accept: 'application/json',
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'No error text');
    throw new Error(`${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
};

const normalizeMediaItem = (item: any, defaultMediaType: 'movie' | 'tv' = 'movie'): MediaItem => ({
  ...item,
  title: item.title || item.name || '',
  media_type: item.media_type || defaultMediaType,
});

export const getTrending = async (): Promise<MediaItem[]> => {
  const data = await fetchFromAPI('/trending/all/week');
  return data.results.map((item: any) => normalizeMediaItem(item));
};

export const getPopularMovies = async (): Promise<MediaItem[]> => {
  const data = await fetchFromAPI('/movie/popular');
  return data.results.map((item: any) => normalizeMediaItem(item, 'movie'));
};

export const getTopRatedMovies = async (): Promise<MediaItem[]> => {
  const data = await fetchFromAPI('/movie/top_rated');
  return data.results.map((item: any) => normalizeMediaItem(item, 'movie'));
};

export const getPopularTV = async (): Promise<MediaItem[]> => {
  const data = await fetchFromAPI('/tv/popular');
  return data.results.map((item: any) => normalizeMediaItem(item, 'tv'));
};

export const searchMulti = async (query: string): Promise<MediaItem[]> => {
  const data = await fetchFromAPI('/search/multi', { query });
  return data.results
    .filter((item: any) => item.media_type !== 'person')
    .map((item: any) => normalizeMediaItem(item));
};

export const getMovieDetails = async (id: string | number): Promise<any> => {
  return fetchFromAPI(`/movie/${id}`);
};

export const getMovieCredits = async (id: string | number): Promise<any> => {
  return fetchFromAPI(`/movie/${id}/credits`);
};

export const getTVDetails = async (id: string | number): Promise<any> => {
  return fetchFromAPI(`/tv/${id}`);
};

export const getTVSeasonDetails = async (id: string | number, season: string | number): Promise<any> => {
  return fetchFromAPI(`/tv/${id}/season/${season}`);
};

export const getMovieVideos = async (id: number): Promise<any[]> => {
  const data = await fetchFromAPI(`/movie/${id}/videos`);
  return (data.results || []).filter(
    (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
};

export const getTVVideos = async (id: number): Promise<any[]> => {
  const data = await fetchFromAPI(`/tv/${id}/videos`);
  return (data.results || []).filter(
    (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
};

export const getSimilarMovies = async (id: number): Promise<MediaItem[]> => {
  const data = await fetchFromAPI(`/movie/${id}/similar`);
  return (data.results || [])
    .filter((item: any) => item.poster_path)
    .map((item: any) => ({ ...item, media_type: 'movie' }))
    .slice(0, 20);
};

export const getSimilarTV = async (id: number): Promise<MediaItem[]> => {
  const data = await fetchFromAPI(`/tv/${id}/similar`);
  return (data.results || [])
    .filter((item: any) => item.poster_path)
    .map((item: any) => ({ ...item, media_type: 'tv' }))
    .slice(0, 20);
};

export const getGenres = async (type: 'movie' | 'tv'): Promise<any[]> => {
  const data = await fetchFromAPI(`/genre/${type}/list`);
  return data.genres || [];
};

export const getByGenre = async (
  type: 'movie' | 'tv',
  genreId: number,
  page: number = 1
): Promise<MediaItem[]> => {
  const data = await fetchFromAPI(
    `/discover/${type}`,
    { with_genres: String(genreId), sort_by: 'popularity.desc', page: String(page) }
  );
  return (data.results || [])
    .filter((item: any) => item.poster_path)
    .map((item: any) => ({ ...item, media_type: type }));
};
