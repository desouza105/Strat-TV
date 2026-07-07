export const navigateToWatch = (
  navigate: (path: string) => void,
  mediaType: 'movie' | 'tv',
  id: number,
  season: number = 1,
  episode: number = 1
) => {
  if (mediaType === 'movie') {
    navigate(`/films/watch/movie/${id}`);
  } else {
    navigate(`/films/watch/tv/${id}/${season}/${episode}`);
  }
};
