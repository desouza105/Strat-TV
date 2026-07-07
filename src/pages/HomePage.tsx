import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { MediaItem, HistoryItem } from '../types/media';
import { 
  getTrending, 
  getPopularMovies, 
  getTopRatedMovies, 
  getPopularTV,
  IMAGE_BASE_URL,
  BACKDROP_SIZE,
  POSTER_SIZE
} from '../services/tmdb';
import { MediaRow } from '../components/MediaRow';
import { useAppContext } from '../context/AppContext';
import { MediaCard } from '../components/MediaCard';

import { navigateToWatch } from '../utils/navigation';

const ContinueWatchingCard: React.FC<{ item: HistoryItem }> = ({ item }) => {
  const navigate = useNavigate();
  const isMovie = item.media_type === 'movie';
  const progress = item.progress || 0;
  const handleClick = () => {
    navigateToWatch(
      navigate,
      item.media_type,
      item.id,
      item.season || 1,
      item.episode || 1
    );
  };
  return (
    <div className="flex flex-col gap-2 group cursor-pointer w-full" onClick={handleClick}>
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card">
        {item.poster_path ? (
          <img src={`${IMAGE_BASE_URL}${POSTER_SIZE}${item.poster_path}`} alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <span className="text-muted-foreground text-sm font-medium">{item.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-center items-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-foreground mb-2">
            <Play className="w-5 h-5 ml-1" fill="currentColor" />
          </div>
          <span className="text-foreground font-bold text-sm">Reprendre</span>
          <span className="text-gray-300 text-xs">{Math.round(progress)}%</span>
        </div>
        {!isMovie && item.season && item.episode && (
          <div className="absolute top-2 right-2 z-20 text-foreground text-[10px] font-bold bg-black/60 px-1.5 py-0.5 rounded">
            S{item.season}E{item.episode}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-zinc-800 z-20">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="px-1">
        <h3 className="text-foreground font-medium text-sm line-clamp-1">{item.title}</h3>
        <div className="text-xs text-muted-foreground mt-1">{isMovie ? 'Film' : 'Série'}</div>
      </div>
    </div>
  );
};

const Top10Row: React.FC<{ items: MediaItem[]; isLoading: boolean }> = ({ items, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -600 : 600, behavior: 'smooth' });
    }
  };
  return (
    <div className="mb-10 group/row relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground text-lg font-bold border-l-[3px] border-primary pl-3 leading-tight">TOP 10 Aujourd'hui</h2>
        </div>
        <div className="relative">
          <button onClick={() => scroll('left')}
            className="absolute left-0 top-[40%] -translate-y-1/2 -ml-4 z-20 w-10 h-10 rounded-full bg-black/80 border border-white/20 text-foreground flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black hidden md:flex">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-4 scroll-smooth"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}>
            {isLoading ? Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="flex-shrink-0 flex flex-col gap-2"
                style={{ width: 'clamp(120px, 28vw, 200px)' }}>
                <div className="aspect-[2/3] bg-card rounded-xl animate-pulse" />
                <div className="h-4 bg-card w-3/4 rounded animate-pulse" />
              </div>
            )) : items.slice(0, 10).map((item, idx) => (
              <div key={`top10-${item.id}`} className="flex-shrink-0 relative"
                style={{ width: 'clamp(120px, 28vw, 200px)' }}>
                <MediaCard item={item} />
                <div className="absolute -left-4 sm:-left-6 bottom-8 sm:bottom-10 pointer-events-none z-20">
                  <span className="text-8xl sm:text-9xl font-black italic text-background"
                    style={{ WebkitTextStroke: '2px rgba(255,255,255,0.8)', textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}>
                    {idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => scroll('right')}
            className="absolute right-0 top-[40%] -translate-y-1/2 -mr-4 z-20 w-10 h-10 rounded-full bg-black/80 border border-white/20 text-foreground flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black hidden md:flex">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

const SlideIn: React.FC<{
  backdropPath: string;
  IMAGE_BASE_URL: string;
  BACKDROP_SIZE: string;
}> = ({ backdropPath, IMAGE_BASE_URL, BACKDROP_SIZE }) => {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(raf1);
  }, []);
  return (
    <div className="absolute inset-0 z-10"
      style={{
        transition: 'transform 950ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: entered ? 'translateX(0%)' : 'translateX(100%)',
      }}>
      <img src={`${IMAGE_BASE_URL}${BACKDROP_SIZE}${backdropPath}`} alt=""
        className="w-full h-full object-cover" />
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, hsl(var(--background)) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
    </div>
  );
};

export const HomePage: React.FC = () => {
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { history } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingData, popMoviesData, topMoviesData, popTVData] = await Promise.all([
          getTrending(), getPopularMovies(), getTopRatedMovies(), getPopularTV(),
        ]);
        setTrending(trendingData);
        setPopularMovies(popMoviesData);
        setTopRatedMovies(topMoviesData);
        setPopularTV(popTVData);
      } catch (error) {
        console.error('Failed to fetch TMDB data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const heroItems = trending.slice(0, 8);

  const currentIdxRef = useRef(0);
  const slidingRef    = useRef(false);
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef     = useRef(false);
  const heroLenRef    = useRef(0);
  heroLenRef.current  = heroItems.length;
  const trendingRef   = useRef<MediaItem[]>([]);
  trendingRef.current = trending;

  const [displayIndex, setDisplayIndex] = useState(0);
  const [nextSlide, setNextSlide] = useState<string | null>(null);

  const doSlide = useCallback((toIdx: number) => {
    if (slidingRef.current) return;
    const nextItem = trendingRef.current[toIdx];
    if (!nextItem) return;
    slidingRef.current = true;
    setNextSlide(nextItem.backdrop_path || null);
    setTimeout(() => {
      currentIdxRef.current = toIdx;
      setDisplayIndex(toIdx);
      setNextSlide(null);
      slidingRef.current = false;
    }, 980);
  }, []);

  const scheduleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!pausedRef.current) {
        const next = (currentIdxRef.current + 1) % heroLenRef.current;
        doSlide(next);
      }
      scheduleNext();
    }, 6000);
  }, [doSlide]);

  useEffect(() => {
    if (heroItems.length > 1) scheduleNext();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [heroItems.length > 1]);

  const goTo = useCallback((idx: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    doSlide(idx);
    setTimeout(() => scheduleNext(), 980);
  }, [doSlide, scheduleNext]);

  const heroItem = heroItems[displayIndex];
  const isMovie = heroItem?.media_type === 'movie';
  const displayTitle = heroItem ? (heroItem.title || heroItem.name) : '';

  return (
    <div className="pb-10 -mt-16">
      {isLoading ? (
        <div className="w-full h-screen bg-background flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : heroItem ? (
        <div
          className="relative w-full h-[90vh] min-h-[600px] overflow-hidden"
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          {/* Current slide exits LEFT */}
          <div className="absolute inset-0"
            style={{
              transitionProperty: 'transform',
              transitionDuration: nextSlide ? '950ms' : '0ms',
              transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform: nextSlide ? 'translateX(-100%)' : 'translateX(0%)',
            }}>
            {heroItem.backdrop_path && (
              <img src={`${IMAGE_BASE_URL}${BACKDROP_SIZE}${heroItem.backdrop_path}`}
                alt="" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, hsl(var(--background)) 0%, transparent 60%)' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          </div>

          {/* Next slide enters from RIGHT */}
          {nextSlide && (
            <SlideIn
              key={nextSlide}
              backdropPath={nextSlide}
              IMAGE_BASE_URL={IMAGE_BASE_URL}
              BACKDROP_SIZE={BACKDROP_SIZE}
            />
          )}

          {/* Text content */}
          <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-full max-w-[1400px] px-4 sm:px-8 lg:px-12 z-20">
            <div style={{ transition: 'opacity 400ms ease', opacity: nextSlide ? 0 : 1 }}
              className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-black text-foreground mb-4 tracking-tight uppercase leading-none">
                {displayTitle}
              </h1>
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground font-medium mb-6">
                <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                <span>{heroItem.vote_average?.toFixed(1)}</span>
                <span>·</span>
                {(heroItem.release_date || heroItem.first_air_date) && (
                  <><span>{(heroItem.release_date || heroItem.first_air_date)?.substring(0, 4)}</span><span>·</span></>
                )}
                <span>{isMovie ? 'Film' : 'Série'}</span>
              </div>
              <p className="text-gray-300 text-sm md:text-base mb-8 line-clamp-3 drop-shadow-md">
                {heroItem.overview}
              </p>
              <div className="flex items-center gap-4">
                <Button onClick={() => navigateToWatch(navigate, heroItem.media_type, heroItem.id)} variant="secondary"
                  className="rounded-full font-bold px-8 h-12 text-sm">
                  <Play className="w-5 h-5 mr-2" fill="currentColor" /> Regarder</Button>
                
                <Button onClick={() => navigate(`/films/${isMovie ? 'movie' : 'tv'}/${heroItem.id}`)}
                  variant="outline" className="rounded-full font-bold px-8 h-12 text-sm bg-transparent border-foreground text-foreground hover:bg-white/10 hover:text-foreground">
                  <span className="text-lg leading-none mr-2">○</span> Plus d'infos
                </Button>
              </div>
            </div>
          </div>

          {/* Dots */}
          {heroItems.length > 1 && (
            <div className="absolute bottom-8 right-8 hidden md:flex items-center gap-2 z-20">
              {heroItems.map((_, idx) => (
                <button key={idx} onClick={() => goTo(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === displayIndex
                      ? 'w-6 h-2 bg-primary'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                  }`} />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* ROWS */}
      <div className="relative z-20 bg-transparent -mt-12 md:-mt-20">
        <Top10Row items={trending} isLoading={isLoading} />
        <MediaRow title="Tendances" items={trending} isLoading={isLoading} supportsToggle />
        <MediaRow title="Films populaires" items={popularMovies} isLoading={isLoading} />
        <MediaRow title="Mieux notés" items={topRatedMovies} isLoading={isLoading} supportsToggle />
        <MediaRow title="Séries populaires" items={popularTV} isLoading={isLoading} />

        {history.length > 0 && (
          <div className="mb-10 group/row relative">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-foreground text-lg font-bold border-l-[3px] border-primary pl-3 leading-tight">
                  Continuer à regarder
                </h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 scroll-smooth"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}>
                {history.map(item => (
                  <div key={`${item.media_type}-${item.id}`} className="flex-shrink-0"
                    style={{ width: 'clamp(120px, 28vw, 200px)' }}>
                    <ContinueWatchingCard item={item} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
