import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { IMAGE_BASE_URL, SMALL_POSTER_SIZE } from '../services/tmdb';
import { navigateToWatch } from '../utils/navigation';

export const HistoryPage: React.FC = () => {
  const { history, clearHistory } = useAppContext();
  const navigate = useNavigate();

  const handleClear = () => {
    if (window.confirm("Effacer tout l'historique ?")) {
      clearHistory();
    }
  };

  const handleResume = (item: any) => {
    navigateToWatch(
      navigate,
      item.media_type,
      item.id,
      item.season || 1,
      item.episode || 1
    );
  };

  return (
    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-[1400px] mx-auto min-h-screen bg-background">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Historique</h1>
          <p className="text-muted-foreground font-medium">
            {history.length} titre{history.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 border border-white/20 rounded-full hover:bg-white/10 hover:text-foreground transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Tout effacer
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Clock className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Votre historique est vide</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Les films et séries que vous regardez apparaîtront ici pour que vous puissiez reprendre facilement là où vous vous êtes arrêté.
          </p>
          <button
            onClick={() => navigate('/films/')}
            className="bg-white text-black px-8 py-2.5 rounded-full font-bold hover:bg-gray-200 transition-colors"
          >
            Commencer à regarder
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-20">
          {history.map(item => {
            const date = new Date(item.watchedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
            
            const progressPercent = item.progress || 0;
            
            return (
              <div 
                key={`${item.media_type}-${item.id}`}
                className="flex flex-row gap-3 p-3 rounded-xl bg-card border border-border hover:border-white/20 transition-colors cursor-pointer group"
                onClick={() => handleResume(item)}
              >
                {/* Poster */}
                <div className="w-16 sm:w-24 h-24 sm:h-36 flex-shrink-0 rounded-xl overflow-hidden bg-background relative">
                  {item.poster_path ? (
                    <img 
                      src={`${IMAGE_BASE_URL}${SMALL_POSTER_SIZE}${item.poster_path}`} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground text-center p-1">
                      Aucune image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-foreground ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-center min-w-0 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-foreground truncate">{item.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span>
                      {item.media_type === 'movie' ? 'Film' : 'Série'}
                    </span>
                    {item.media_type === 'tv' && (
                      <span className="font-medium">
                        S{item.season || 1} E{item.episode || 1}
                      </span>
                    )}
                    <span>·</span>
                    <span>Vu le {date}</span>
                  </div>
                  
                  {/* Progress Bar inside Info */}
                  <div className="w-full max-w-sm mt-auto">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
