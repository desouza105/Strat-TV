import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, Check } from 'lucide-react';
import { getMovieDetails, getMovieCredits, getMovieVideos, getSimilarMovies, IMAGE_BASE_URL, BACKDROP_SIZE, POSTER_SIZE } from '../services/tmdb';
import { useAppContext } from '../context/AppContext';
import { MediaItem } from '../types/media';
import { TrailerModal } from '../components/TrailerModal';
import { MediaRow } from '../components/MediaRow';
import { navigateToWatch } from '../utils/navigation';

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [similar, setSimilar] = useState<MediaItem[]>([]);
  const { watchlist, addToWatchlist, removeFromWatchlist, history } = useAppContext();

  const movieId = parseInt(id || '0', 10);
  const isInWatchlist = watchlist.some(w => w.id === movieId);
  const historyItem = history.find(h => h.id === movieId);
  
  const resumeMinutes = historyItem && historyItem.timestamp > 60 
    ? Math.floor(historyItem.timestamp / 60) 
    : 0;

  useEffect(() => {
    if (movieId) {
      Promise.all([
        getMovieDetails(movieId),
        getMovieCredits(movieId),
        getMovieVideos(movieId),
        getSimilarMovies(movieId)
      ]).then(([movieData, creditsData, videosData, similarData]) => {
        setMovie(movieData);
        setCredits(creditsData);
        setSimilar(similarData);
        const trailer = videosData[0];
        if (trailer) setTrailerKey(trailer.key);
      }).catch(console.error);
    }
  }, [movieId]);

  if (!movie) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleWatchlistClick = () => {
    const item: MediaItem = {
      id: movie.id,
      title: movie.title,
      name: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      overview: movie.overview,
      media_type: 'movie',
      vote_average: movie.vote_average,
      release_date: movie.release_date,
    };
    if (isInWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(item);
    }
  };

  const handlePlayClick = () => {
    navigateToWatch(navigate, 'movie', movie.id);
  };

  return (
    <div className="min-h-screen bg-background pb-20 -mt-16">
      <div className="relative w-full h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0">
          {movie.backdrop_path && (
            <img 
              src={`${IMAGE_BASE_URL}${BACKDROP_SIZE}${movie.backdrop_path}`} 
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-end pb-10">
          <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 lg:px-12">
            <div className="max-w-4xl relative z-10 flex flex-col md:flex-row gap-8 items-end">
              {movie.poster_path && (
                <img 
                  src={`${IMAGE_BASE_URL}${POSTER_SIZE}${movie.poster_path}`} 
                  alt={movie.title}
                  className="w-36 lg:w-48 rounded-xl shadow-2xl hidden lg:block border border-zinc-800"
                />
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 drop-shadow-2xl break-words">
                  {movie.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300 font-medium mb-4">
                  <span className="text-green-500 font-bold">{Math.round(movie.vote_average * 10)}% Recommandé</span>
                  {movie.release_date && <span>{movie.release_date.substring(0, 4)}</span>}
                  {movie.runtime > 0 && <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
                </div>
                
                <p className="text-gray-300 text-sm md:text-base mb-6 line-clamp-3 sm:line-clamp-4 max-w-2xl drop-shadow-md">
                  {movie.overview}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <button 
                    onClick={handlePlayClick}
                    className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded hover:bg-gray-200 transition-colors font-bold text-sm md:text-base"
                  >
                    <Play className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                    {resumeMinutes > 0 ? `Reprendre (${resumeMinutes} min)` : 'Regarder'}
                  </button>
                  <button 
                    onClick={handleWatchlistClick}
                    className="flex items-center gap-2 bg-zinc-800 text-foreground border border-zinc-700 px-6 py-2 md:py-3 rounded hover:bg-zinc-700 transition-colors font-bold text-sm md:text-base"
                  >
                    {isInWatchlist ? (
                      <>
                        <Check className="w-5 h-5" />
                        Ma liste
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Ma liste
                      </>
                    )}
                  </button>
                  {trailerKey && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="flex items-center gap-2 bg-transparent text-foreground border border-white/40 px-6 py-2 md:py-3 rounded hover:bg-white/10 transition-colors font-bold text-sm md:text-base"
                    >
                      <Play className="w-5 h-5" fill="currentColor" /> Bande-annonce
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 mt-8 pb-20">
        <div className="flex flex-wrap gap-2 mb-12">
          {movie.genres?.map((genre: any) => (
            <span key={genre.id} className="text-xs font-medium bg-zinc-800/80 text-gray-300 px-3 py-1 rounded-full border border-zinc-700 backdrop-blur-sm">
              {genre.name}
            </span>
          ))}
        </div>

        {credits && credits.cast && credits.cast.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-6">Distribution</h2>
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
              {credits.cast.slice(0, 10).map((actor: any) => (
                <div key={actor.id} className="w-24 flex-shrink-0 flex flex-col items-center">
                  {actor.profile_path ? (
                    <img src={`${IMAGE_BASE_URL}w185${actor.profile_path}`} alt={actor.name} className="w-24 h-24 object-cover rounded-full mb-2 bg-zinc-800" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mb-2 text-gray-500 font-bold text-xl">
                      {actor.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-foreground font-bold text-xs text-center leading-tight mb-1">{actor.name}</span>
                  <span className="text-gray-500 text-[10px] text-center leading-tight line-clamp-1">{actor.character}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {similar.length > 0 && (
          <div className="-mx-4 sm:-mx-8 lg:-mx-12 mt-12">
            <MediaRow title="Vous aimerez aussi" items={similar} isLoading={false} />
          </div>
        )}
      </div>

      {showTrailer && trailerKey && (
        <TrailerModal
          videoKey={trailerKey}
          title={`${movie.title} — Bande-annonce`}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
};
