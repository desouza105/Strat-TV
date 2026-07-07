import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RefreshCw, Plus, Check, Clapperboard, Star } from 'lucide-react';
import { getTrending, getMovieDetails, getTVDetails, IMAGE_BASE_URL, BACKDROP_SIZE, POSTER_SIZE } from '../services/tmdb';
import { useAppContext } from '../context/AppContext';
import { MediaItem } from '../types/media';
import { navigateToWatch } from '../utils/navigation';

export const TonightPage: React.FC = () => {
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useAppContext();
  const [pool, setPool] = useState<MediaItem[]>([]);
  const [current, setCurrent] = useState<MediaItem | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

  // Load trending pool once
  useEffect(() => {
    getTrending().then(data => {
      setPool(data);
      const pick = data[Math.floor(Math.random() * data.length)];
      setCurrent(pick);
    }).catch(console.error);
  }, []);

  // Fetch full details when current changes
  useEffect(() => {
    if (!current) return;
    setIsLoading(true);
    setDetails(null);
    const isMovie = current.media_type === 'movie';
    const fetcher = isMovie
      ? getMovieDetails(current.id)
      : getTVDetails(current.id);
    fetcher.then(d => setDetails(d)).catch(console.error).finally(() => setIsLoading(false));
  }, [current]);

  const reroll = useCallback(() => {
    if (pool.length < 2) return;
    setIsSpinning(true);
    setTimeout(() => {
      let next: MediaItem;
      do {
        next = pool[Math.floor(Math.random() * pool.length)];
      } while (next.id === current?.id);
      setCurrent(next);
      setIsSpinning(false);
    }, 400);
  }, [pool, current]);

  if (!current || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isMovie = current.media_type === 'movie';
  const title = current.title || current.name || '';
  const year = (current.release_date || current.first_air_date || '').substring(0, 4);
  const isInWatchlist = watchlist.some(w => w.id === current.id);

  const genres = details?.genres?.slice(0, 3).map((g: any) => g.name).join(' · ') || '';
  const runtime = isMovie && details?.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : details?.number_of_seasons
    ? `${details.number_of_seasons} saison${details.number_of_seasons > 1 ? 's' : ''}`
    : '';

  const handleWatchlist = () => {
    if (isInWatchlist) {
      removeFromWatchlist(current.id);
    } else {
      addToWatchlist({ ...current });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Full backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: isSpinning ? 0 : 1 }}
      >
        {current.backdrop_path && (
          <img
            src={`${IMAGE_BASE_URL}${BACKDROP_SIZE}${current.backdrop_path}`}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, hsl(var(--background)) 30%, hsl(var(--background)/0.7) 60%, hsl(var(--background)/0.3) 100%)' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end pb-16 pt-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 w-full">

          {/* Label */}
          <div className="flex items-center gap-2 mb-6">
            <Clapperboard className="w-6 h-6 text-primary" />
            <span className="text-primary font-bold text-sm uppercase tracking-widest">
              Votre choix du soir
            </span>
          </div>

          {/* Poster + Info */}
          <div className="flex flex-col md:flex-row gap-8 items-end">
            {/* Poster */}
            <div
              className="w-40 md:w-52 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border border-border transition-opacity duration-500"
              style={{ opacity: isSpinning ? 0 : 1 }}
            >
              {current.poster_path && (
                <img
                  src={`${IMAGE_BASE_URL}${POSTER_SIZE}${current.poster_path}`}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Text */}
            <div
              className="flex-1 transition-opacity duration-500"
              style={{ opacity: isSpinning ? 0 : 1 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground uppercase tracking-tight leading-none mb-4">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                {year && <span>{year}</span>}
                {runtime && <><span>·</span><span>{runtime}</span></>}
                {genres && <><span>·</span><span>{genres}</span></>}
                <span>·</span>
                <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                <span>{current.vote_average?.toFixed(1)}</span>
              </div>

              <p className="text-gray-300 text-sm md:text-base max-w-2xl mb-8 line-clamp-3 leading-relaxed">
                {current.overview}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigateToWatch(navigate, current.media_type, current.id)}
                  className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  Regarder maintenant
                </button>

                <button
                  onClick={handleWatchlist}
                  className="flex items-center gap-2 bg-white/10 text-foreground border border-white/20 px-6 py-3 rounded-full font-bold text-sm hover:bg-white/20 transition-colors"
                >
                  {isInWatchlist ? (
                    <><Check className="w-5 h-5" /> Dans ma liste</>
                  ) : (
                    <><Plus className="w-5 h-5" /> Ma liste</>
                  )}
                </button>

                <button
                  onClick={reroll}
                  disabled={isSpinning}
                  className="flex items-center gap-2 bg-transparent text-muted-foreground border border-white/20 px-6 py-3 rounded-full font-bold text-sm hover:text-foreground hover:border-border0 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                  Autre suggestion
                </button>

                <button
                  onClick={() => 
navigate(`/films/${isMovie ? 'movie' : 'tv'}/${current.id}`)}
                  className="flex items-center gap-2 bg-transparent text-muted-foreground border border-white/20 px-6 py-3 rounded-full font-bold text-sm hover:text-foreground transition-colors"
                >
                  Plus d'infos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
