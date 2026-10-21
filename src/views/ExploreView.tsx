import { useMemo, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PORTAL_SOURCES, PlaylistSource, getCustomPlaylists } from '../constants/portal_data';
import { cn } from '@/lib/utils';

interface ExploreViewProps {
  playlistName: string;
  isLoading: boolean;
  onLoadPlaylist: (url: string) => void;
  onImport: () => void;
}

const TAB_LABELS: Record<PlaylistSource['category'], string> = { Country: 'Pays', Language: 'Langues', Genre: 'Genres' };
// La section protégée par code reste gérée par l'ancien en-tête (voir App.tsx) : elle n'apparaît pas ici.
const HIDDEN = new Set(['XXX ADULT']);

function SourceTile({ source, selected, disabled, onClick }: { source: PlaylistSource; selected: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex h-28 min-w-0 flex-col justify-between rounded-[20px] border border-white/[0.06] p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-60',
        selected ? 'bg-gradient-to-br from-mint/70 to-indigo-700/70' : 'bg-card hover:bg-white/[0.06]'
      )}
    >
      {source.code ? (
        <img src={`https://flagcdn.com/w40/${source.code}.png`} alt="" width={28} height={20} className="h-5 w-7 rounded-sm object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
      ) : (
        <span className="grid size-9 place-items-center rounded-btn bg-primary text-[13px] font-bold text-primary-foreground">{source.name.slice(0, 2).toUpperCase()}</span>
      )}
      <span className="flex items-baseline justify-between gap-2">
        <span className="truncate text-base font-semibold">{source.name}</span>
        <span className={cn('text-[13px]', selected ? 'text-white/80' : 'text-muted-foreground')}>{selected ? 'Chargée' : 'Voir'}</span>
      </span>
    </button>
  );
}

export default function ExploreView({ playlistName, isLoading, onLoadPlaylist, onImport }: ExploreViewProps) {
  const categories = useMemo(
    () => (['Country', 'Language', 'Genre'] as const).filter((c) => PORTAL_SOURCES.some((s) => s.category === c && !HIDDEN.has(s.name))),
    []
  );
  const [tab, setTab] = useState<PlaylistSource['category']>(categories[0] ?? 'Country');
  const [query, setQuery] = useState('');
  const custom = useMemo(() => getCustomPlaylists(), []);

  const list = useMemo(
    () => PORTAL_SOURCES.filter((s) => s.category === tab && !HIDDEN.has(s.name) && s.name.toLowerCase().includes(query.toLowerCase())),
    [tab, query]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 md:py-7 md:pr-9 md:pl-2">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold leading-9 md:text-[30px]">Explorer</h1>
        <div className="flex items-center gap-3">
          <label className="relative">
            <span className="sr-only">Rechercher une source</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="h-9 w-56 rounded-btn border border-input bg-card pl-9 pr-3 text-[13px] outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </label>
          <Button variant="outline" onClick={onImport}><Plus /> Importer</Button>
        </div>
      </header>

      <div role="tablist" aria-label="Catégories" className="flex gap-6 border-b border-border">
        {categories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={tab === c}
            onClick={() => setTab(c)}
            className={cn('-mb-px border-b-2 py-2.5 text-sm outline-none focus-visible:text-foreground', tab === c ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}
          >
            {TAB_LABELS[c]}
          </button>
        ))}
      </div>

      {custom.length > 0 && !query && (
        <section aria-label="Mes playlists" className="flex flex-col gap-3">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Mes playlists</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {custom.map((s) => (
              <SourceTile key={s.url} source={s} selected={playlistName === s.name} disabled={isLoading} onClick={() => onLoadPlaylist(s.url)} />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {list.map((s) => (
          <SourceTile key={s.url} source={s} selected={playlistName === s.name} disabled={isLoading} onClick={() => onLoadPlaylist(s.url)} />
        ))}
        {list.length === 0 && <p className="col-span-full text-sm text-muted-foreground">Aucun résultat.</p>}
      </div>
    </div>
  );
}
