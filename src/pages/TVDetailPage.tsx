import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, Check } from 'lucide-react';
import { getTVDetails, getTVSeasonDetails, getTVVideos, getSimilarTV, IMAGE_BASE_URL, BACKDROP_SIZE, POSTER_SIZE } from '../services/tmdb';
import { useAppContext } from '../context/AppContext';
import { MediaItem } from '../types/media';
import { TrailerModal } from '../components/TrailerModal';
import { MediaRow } from '../components/MediaRow';

export const TVDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tvShow, setTvShow] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [seasonData, setSeasonData] = useState<any>(null);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [similar, setSimilar] = useState<MediaItem[]>([]);
  
  const { watchlist, addToWatchlist, removeFromWatchlist, history } = useAppContext();

  const showId = parseInt(id || '0', 10);
  const isInWatchlist = watchlist.some(w => w.id === showId);
  const historyItem = history.find(h => h.id === showId);

  useEffect(() => {
    if (showId) {
      Promise.all([
        getTVDetails(showId),
        getTVVideos(showId),
        getSimilarTV(showId)
      ]).then(([data, videosData, similarData]) => {
        setTvShow(data);
        const validSeasons = data.seasons?.filter((s: any) => s.season_number > 0) || [];
        if (validSeasons.length > 0) {
          setSelectedSeason(validSeasons[0].season_number);
        }
        const trailer = videosData[0];
        if (trailer) setTrailerKey(trailer.key);
        setSimilar(similarData);
      }).catch(console.error);
    }
  }, [showId]);

  useEffect(() => {
    if (showId && selectedSeason) {
      setIsLoadingSeason(true);
      getTVSeasonDetails(showId, selectedSeason)
        .then(setSeasonData)
        .catch(console.error)
        .finally(() => setIsLoadingSeason(false));
    }
  }, [showId, selectedSeason]);

  if (!tvShow) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleWatchlistClick = () => {
    const item: MediaItem = {
      id: tvShow.id,
      title: tvShow.name,
      name: tvShow.name,
      poster_path: tvShow.poster_path,
      backdrop_path: tvShow.backdrop_path,
      overview: tvShow.overview,
      media_type: 'tv',
      vote_average: tvShow.vote_average,
      first_air_date: tvShow.first_air_date,
    };
    if (isInWatchlist) {
      removeFromWatchlist(tvShow.id);
    } else {
      addToWatchlist(item);
    }
  };

  const handlePlayEpisode = (episodeNumber: number) => {
    
navigate(`/films/watch/tv/${tvShow.id}/${selectedSeason}/${episodeNumber}`, { state: { show: tvShow } });
  };

  const validSeasons = tvShow.seasons?.filter((s: any) => s.season_number > 0) || [];

  return (
    <div className="min-h-screen bg-background pb-20 -mt-16">
      <div className="relative w-full h-[50vh] md:h-[60vh]">
        <div className="absolute inset-0">
          {tvShow.backdrop_path && (
            <img 
              src={`${IMAGE_BASE_URL}${BACKDROP_SIZE}${tvShow.backdrop_path}`} 
              alt={tvShow.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-end pb-10">
          <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 lg:px-12">
            <div className="max-w-4xl relative z-10 flex flex-col md:flex-row gap-8 items-end">
              {tvShow.poster_path && (
                <img 
                  src={`${IMAGE_BASE_URL}${POSTER_SIZE}${tvShow.poster_path}`} 
                  alt={tvShow.name}
                  className="w-36 lg:w-48 rounded-xl shadow-2xl hidden lg:block border border-zinc-800"
                />
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 drop-shadow-2xl break-words">
                  {tvShow.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300 font-medium mb-4">
                  <span className="text-green-500 font-bold">{Math.round(tvShow.vote_average * 10)}% Recommandé</span>
                  {tvShow.first_air_date && <span>{tvShow.first_air_date.substring(0, 4)}</span>}
                  <span>{tvShow.number_of_seasons} Saison{tvShow.number_of_seasons > 1 ? 's' : ''}</span>
                </div>
                
                <p className="text-gray-300 text-sm md:text-base mb-6 line-clamp-3 sm:line-clamp-4 max-w-2xl drop-shadow-md">
                  {tvShow.overview}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <button 
                    onClick={handleWatchlistClick}
                    className="flex items-center gap-2 bg-zinc-800 text-foreground border border-zinc-700 px-6 py-2 md:py-3 rounded hover:bg-zinc-700 transition-colors font-bold text-sm md:text-base backdrop-blur-sm"
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

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 mt-12">
        <div className="flex flex-wrap gap-2 mb-12">
          {tvShow.genres?.map((genre: any) => (
            <span key={genre.id} className="text-xs font-medium bg-zinc-800/80 text-gray-300 px-3 py-1 rounded-full border border-zinc-700 backdrop-blur-sm">
              {genre.name}
            </span>
          ))}
        </div>

        {historyItem && historyItem.season && historyItem.episode && (
          <div className="mb-8 p-4 bg-zinc-900 border-l-4 border-primary rounded flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-foreground font-bold">Reprendre S{historyItem.season} E{historyItem.episode} • {Math.round(historyItem.progress || 0)}% visionné</p>
            </div>
            <button 
              onClick={() => 
navigate(`/films/watch/tv/${tvShow.id}/${historyItem.season}/${historyItem.episode}`, { state: { show: tvShow } })}
              className="flex items-center gap-2 bg-primary text-foreground px-6 py-2 rounded hover:bg-primary/90 transition-colors font-bold whitespace-nowrap"
            >
              <Play className="w-5 h-5" fill="currentColor" />
              Reprendre
            </button>
          </div>
        )}

        <div className="flex items-center gap-6 overflow-x-auto border-b border-zinc-800 pb-2 mb-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
          {validSeasons.map((season: any) => (
            <button
              key={season.season_number}
              onClick={() => setSelectedSeason(season.season_number)}
              className={`whitespace-nowrap text-lg font-medium transition-colors ${
                selectedSeason === season.season_number
                  ? 'text-foreground border-b-2 border-primary pb-2 -mb-[10px]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {season.name}
            </button>
          ))}
        </div>

        {isLoadingSeason ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {seasonData?.episodes?.map((episode: any) => {
              const isWatched = historyItem && historyItem.season === selectedSeason && historyItem.episode === episode.episode_number;
              const progressPercent = isWatched && historyItem.progress ? historyItem.progress : 0;
              
              return (
                <div 
                  key={episode.id}
                  className="flex flex-col md:flex-row gap-6 p-4 rounded-xl hover:bg-zinc-800/50 transition-colors group border-b border-zinc-800/50 md:border-none"
                >
                  <div 
                    className="relative w-full md:w-56 aspect-video bg-zinc-800 rounded overflow-hidden flex-shrink-0 cursor-pointer" 
                    onClick={() => handlePlayEpisode(episode.episode_number)}
                  >
                    {episode.still_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`} 
                        alt={episode.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">Pas d'image</div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-10 h-10 text-foreground border-2 border-white rounded-full p-2 bg-black/30" fill="currentColor" />
                    </div>
                    {progressPercent > 0 && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-600">
                        <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-foreground font-medium text-lg leading-tight">
                        {episode.episode_number}. {episode.name}
                      </h3>
                      {episode.runtime > 0 && (
                        <span className="text-gray-400 text-sm whitespace-nowrap">{episode.runtime} min</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                      {episode.overview || "Aucune description disponible pour cet épisode."}
                    </p>
                  </div>
                </div>
              );
            })}
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
          title={`${tvShow.name} — Bande-annonce`}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
};
