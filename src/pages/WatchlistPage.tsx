import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bookmark, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MediaCard } from '../components/MediaCard';
import { WatchlistItem } from '../types/media';

const WatchlistCard: React.FC<{ item: WatchlistItem; onRemove: (id: number) => void }> = ({ item, onRemove }) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Retirer de ma liste ?')) {
      onRemove(item.id);
    }
  };

  const date = new Date(item.addedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col relative group w-full">
      <div className="relative">
        <MediaCard item={item} />
        <Button
          onClick={handleRemove}
          variant="outline" size="icon" className="absolute top-2 left-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-black/80 border-white/20 shadow-2xl hover:bg-black hover:text-foreground"
          title="Retirer"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <span className="text-xs text-muted-foreground mt-2 font-medium px-1">Ajouté le {date}</span>
    </div>
  );
};

export const WatchlistPage: React.FC = () => {
  const { watchlist, removeFromWatchlist } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="pt-24 px-4 sm:px-8 lg:px-12 max-w-[1400px] mx-auto min-h-screen bg-background">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Ma Liste</h1>
        <p className="text-muted-foreground font-medium">
          {watchlist.length} titre{watchlist.length !== 1 ? 's' : ''}
        </p>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Bookmark className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Votre liste est vide</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Ajoutez des films et séries pour les retrouver ici plus tard.
          </p>
          <Button
            onClick={() => navigate('/films/')}
            variant="secondary" className="rounded-full font-bold px-8 h-12"
          >
            Explorer
          </Button>
        </div>
      ) : (
        <div className="grid pb-20" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 'clamp(8px, 2vw, 20px)' }}>
          {watchlist.map(item => (
            <WatchlistCard key={`${item.media_type}-${item.id}`} item={item} onRemove={removeFromWatchlist} />
          ))}
        </div>
      )}
    </div>
  );
};
