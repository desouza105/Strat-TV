import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, X, Play } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getTVDetails, getTVSeasonDetails } from '../services/tmdb';

export const WatchTVPage: React.FC = () => {
  const { id, season, episode } = useParams<{ id: string; season: string; episode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { history, addToHistory, updateProgress } = useAppContext();

  const [tvShow, setTvShow] = useState<any>(location.state?.show || null);
  const [episodeData, setEpisodeData] = useState<any>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showId = parseInt(id || '0', 10);
  const seasonNum = parseInt(season || '1', 10);
  const episodeNum = parseInt(episode || '1', 10);

  const savedItem = history.find(
    h => h.id === showId && h.season === seasonNum && h.episode === episodeNum
  );
  const startTimeRef = useRef<number>(
    savedItem && savedItem.timestamp > 30 ? savedItem.timestamp : 0
  );

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const init = async () => {
      let currentShow = tvShow;
      if (!currentShow && showId) {
        try {
          currentShow = await getTVDetails(showId);
          setTvShow(currentShow);
        } catch (err) { console.error(err); return; }
      }
      if (currentShow) {
        addToHistory({
          id: currentShow.id,
          title: currentShow.name,
          name: currentShow.name,
          poster_path: currentShow.poster_path,
          backdrop_path: currentShow.backdrop_path,
          overview: currentShow.overview,
          media_type: 'tv',
          vote_average: currentShow.vote_average,
          first_air_date: currentShow.first_air_date,
          season: seasonNum,
          episode: episodeNum,
        } as any);
      }
      try {
        const seasonDetails = await getTVSeasonDetails(showId, seasonNum);
        const ep = seasonDetails.episodes?.find(
          (e: any) => e.episode_number === episodeNum
        );
        if (ep) setEpisodeData(ep);
      } catch (err) { console.error(err); }
    };
    init();
  }, [showId, seasonNum, episodeNum]);

  const buildUrl = useRef<string>(
    (() => {
      const progress = startTimeRef.current > 30
        ? `&progress=${Math.floor(startTimeRef.current)}`
        : '';
      return `https://www.vidking.net/embed/tv/${showId}/${seasonNum}/${episodeNum}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true${progress}`;
    })()
  );

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
              updateProgress(showId, payload.progress, payload.currentTime);
            }
          } else if (payload?.event === 'ended') {
            handleEnded();
          }
        }
      } catch {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleEnded = useCallback(() => {
    setShowCountdown(true);
    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setShowCountdown(false);
          
navigate(`/films/watch/tv/${showId}/${seasonNum}/${episodeNum + 1}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [navigate, showId, seasonNum, episodeNum]);

  const cancelCountdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setShowCountdown(false);
  }, []);

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
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
          {tvShow ? tvShow.name : 'Chargement...'}
          <span className="text-gray-400 text-base ml-2 font-normal">
            S{seasonNum} E{episodeNum}
          </span>
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

        {episodeData && (
          <div className="p-6 md:p-8 bg-card mt-4 rounded-xl mb-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-2">{episodeData.name}</h2>
            <p className="text-gray-300 leading-relaxed max-w-4xl">
              {episodeData.overview || 'Aucune description disponible.'}
            </p>
          </div>
        )}
      </div>

      {showCountdown && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-8 md:p-12 pointer-events-none">
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl pointer-events-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Épisode suivant</p>
                <p className="text-foreground font-bold text-lg">S{seasonNum} E{episodeNum + 1}</p>
              </div>
              <button
                onClick={cancelCountdown}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none"
                    stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <circle cx="28" cy="28" r="24" fill="none"
                    stroke="currentColor" className="text-primary" strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - countdown / 5)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-foreground font-black text-xl">
                  {countdown}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Lecture dans <span className="text-foreground font-bold">{countdown}s</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  cancelCountdown();
                  
navigate(`/films/watch/tv/${showId}/${seasonNum}/${episodeNum + 1}`);
                }}
                className="flex-1 bg-primary text-foreground py-2.5 rounded-full font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Lancer maintenant
              </button>
              <button
                onClick={cancelCountdown}
                className="px-4 py-2.5 bg-white/10 text-foreground rounded-full font-bold text-sm hover:bg-white/20 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
