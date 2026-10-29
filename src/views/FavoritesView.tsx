import { Heart, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IPTVChannel } from '../types/iptv';
import { cn } from '@/lib/utils';

interface FavoritesViewProps {
  favorites: IPTVChannel[];
  selectedChannel: IPTVChannel | null;
  onWatch: (channel: IPTVChannel) => void;
  onRemove: (channel: IPTVChannel) => void;
  onExplore: () => void;
}

export default function FavoritesView({ favorites, selectedChannel, onWatch, onRemove, onExplore }: FavoritesViewProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 md:py-7 md:pr-9 md:pl-2">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold leading-9 md:text-[30px]">Favoris</h1>
        <span className="text-sm text-muted-foreground">{favorites.length} chaîne{favorites.length > 1 ? 's' : ''}</span>
      </header>

      {favorites.length === 0 ? (
        <div className="m-auto flex max-w-md flex-col items-center gap-4 text-center">
          <div className="grid size-[72px] place-items-center rounded-[20px] border border-border bg-card text-muted-foreground"><Heart size={30} aria-hidden="true" /></div>
          <h2 className="text-[28px] font-semibold">Aucun favori</h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground">Ajoute une chaîne avec le cœur dans la liste ou sous le lecteur : elle apparaîtra ici, même après avoir changé de source.</p>
          <Button onClick={onExplore}><Compass /> Explorer les sources</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {favorites.map((c) => {
            const active = selectedChannel?.url === c.url;
            return (
              <div key={c.url} className={cn('relative flex h-36 min-w-0 flex-col justify-between rounded-tile p-4', active ? 'bg-gradient-to-br from-indigo-600 to-blue-800/60' : 'bg-card border border-white/[0.06]')}>
                <button
                  type="button"
                  onClick={() => onWatch(c)}
                  aria-label={`Regarder ${c.name}`}
                  className="absolute inset-0 rounded-tile outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                />
                <div className="pointer-events-none flex items-center justify-between">
                  <Badge variant={active ? 'inverse' : 'neutral'}>{active ? 'EN COURS' : (c.group || 'Général')}</Badge>
                </div>
                <div className="pointer-events-none min-w-0">
                  <div className="truncate text-base font-semibold">{c.name}</div>
                  <div className="truncate text-[13px] text-muted-foreground">{c.group || 'Général'}</div>
                </div>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  aria-label={`Retirer ${c.name} des favoris`}
                  className="absolute right-3 top-3"
                  onClick={() => onRemove(c)}
                >
                  <Heart fill="currentColor" className="text-mint" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
