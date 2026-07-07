import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getMovieDetails } from '../services/tmdb';
import { MediaItem } from '../types/media';

export const WatchMoviePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { history, addToHistory, updateProgress } = useAppContext();
  const [movie, setMovie] = useState<any>(location.state?.movie || null);

  const movieId = parseInt(id || '0', 10);

  const savedItem = history.find(h => h.id === movieId);
  const startTimeRef = useRef<number>(
    savedItem && savedItem.timestamp > 30 ? savedItem.timestamp : 0
  );

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const init = async () => {
      let currentMovie = movie;
      if (!currentMovie && movieId) {
        try {
          currentMovie = await getMovieDetails(movieId);
          setMovie(currentMovie);
        } catch (err) {
          console.error(err);
          return;
        }
      }
      if (currentMovie) {
        addToHistory({
          id: currentMovie.id,
          title: currentMovie.title,
          name: currentMovie.title,
          poster_path: currentMovie.poster_path,
          backdrop_path: currentMovie.backdrop_path,
          overview: currentMovie.overview,
          media_type: 'movie',
          vote_average: currentMovie.vote_average,
          release_date: currentMovie.release_date,
        } as MediaItem);
      }
    };
    init();
  }, [movieId]);

  const buildUrl = useRef<string>(
    (() => {
      const progress = startTimeRef.current > 30
        ? `&progress=${Math.floor(startTimeRef.current)}`
        : '';
      return `https://www.vidking.net/embed/movie/${movieId}?color=e50914&autoPlay=true${progress}`;
    })()
  );

  const handleProgress = (progress: number, timestamp: number) => {
    updateProgress(movieId, progress, timestamp);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const parsed = typeof event.data === 'string'
          ? JSON.parse(event.data)
          : event.data;
        if (parsed?.type === 'PLAYER_EVENT') {
          const payload = parsed.data;
          if (payload?.event === 'timeupdate') {
            const currentTime = Math.floor(payload.currentTime || 0);
            if (currentTime > 0 && currentTime % 10 === 0) {
              handleProgress(payload.progress, payload.currentTime);
            }
          }
        }
      } catch {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="min-h-screen bg-background pt-16 flex flex-col">
      <div className="flex items-center px-4 py-4 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="font-medium">Retour</span>
        </button>
        <h1 className="text-foreground font-bold text-lg md:text-xl flex-1 text-center truncate pr-16">
          {movie ? movie.title : 'Chargement...'}
        </h1>
      </div>

      <div className="w-full max-w-[1400px] mx-auto flex-1 flex flex-col px-4 sm:px-8 lg:px-12">
        <div className="w-full aspect-video bg-black relative shadow-2xl rounded-xl overflow-hidden">
          <iframe
            src={buildUrl.current}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *"
            referrerPolicy="no-referrer-when-downgrade"
            frameBorder="0"
            title="Vidking Player"
          />
        </div>

        {movie && (
          <div className="p-6 md:p-8 bg-card mt-4 rounded-xl mb-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-3">{movie.title}</h2>
            <p className="text-gray-300 leading-relaxed max-w-4xl">{movie.overview}</p>
          </div>
        )}
      </div>
    </div>
  );
};
