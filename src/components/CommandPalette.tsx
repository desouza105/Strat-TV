import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Tv, Globe, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { IPTVChannel } from '../types/iptv';
import { PORTAL_SOURCES } from '../constants/portal_data';
import type { AppView } from './NavRail';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channels: IPTVChannel[];
  onSelectChannel: (channel: IPTVChannel) => void;
  onLoadSource: (url: string) => void;
  onNavigate: (view: AppView) => void;
  onOpenImport: () => void;
  onOpenMosaic: () => void;
}

type Item = { id: string; group: 'Chaînes' | 'Sources' | 'Actions'; label: string; hint: string; icon: typeof Tv; run: () => void };

/** Recherche globale (Ctrl K) : chaînes chargées, sources du portail et actions. */
export default function CommandPalette({ open, onOpenChange, channels, onSelectChannel, onLoadSource, onNavigate, onOpenImport, onOpenMosaic }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) { setQuery(''); setActive(0); } }, [open]);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const close = (fn: () => void) => () => { onOpenChange(false); fn(); };
    const actions: Item[] = ([
      { id: 'a-home', group: 'Actions', label: "Aller à l'accueil", hint: 'Action', icon: Zap, run: close(() => onNavigate('home')) },
      { id: 'a-explore', group: 'Actions', label: 'Explorer les sources', hint: 'Action', icon: Zap, run: close(() => onNavigate('explore')) },
      { id: 'a-mosaic', group: 'Actions', label: 'Ouvrir la mosaïque', hint: 'Action', icon: Zap, run: close(onOpenMosaic) },
      { id: 'a-import', group: 'Actions', label: 'Importer une playlist', hint: 'Action', icon: Zap, run: close(onOpenImport) },
      { id: 'a-activity', group: 'Actions', label: "Voir l'activité", hint: 'Action', icon: Zap, run: close(() => onNavigate('activity')) },
      { id: 'a-tv', group: 'Actions', label: 'Mode TV', hint: 'Action', icon: Zap, run: close(() => onNavigate('tv')) },
      { id: 'a-fav', group: 'Actions', label: 'Voir les favoris', hint: 'Action', icon: Zap, run: close(() => onNavigate('favorites')) },
      { id: 'a-settings', group: 'Actions', label: 'Ouvrir les réglages', hint: 'Action', icon: Zap, run: close(() => onNavigate('settings')) },
    ] as Item[]).filter((a) => !q || a.label.toLowerCase().includes(q));
    const chans: Item[] = (q ? channels.filter((c) => c.name.toLowerCase().includes(q)) : [])
      .slice(0, 6)
      .map((c) => ({ id: `c-${c.url}`, group: 'Chaînes' as const, label: c.name, hint: c.group || 'Direct', icon: Tv, run: close(() => onSelectChannel(c)) }));
    const srcs: Item[] = (q ? PORTAL_SOURCES.filter((s) => s.name !== 'XXX ADULT' && s.name.toLowerCase().includes(q)) : [])
      .slice(0, 5)
      .map((s) => ({ id: `s-${s.url}`, group: 'Sources' as const, label: s.name, hint: 'Source', icon: Globe, run: close(() => onLoadSource(s.url)) }));
    return [...chans, ...srcs, ...actions];
  }, [query, channels, onOpenChange, onNavigate, onOpenImport, onOpenMosaic, onSelectChannel, onLoadSource]);

  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); items[active]?.run(); }
  };

  let lastGroup = '';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="top-[18%] max-w-none translate-y-0 gap-0 p-4 sm:max-w-[640px]">
        <DialogTitle className="sr-only">Recherche</DialogTitle>
        <div className="flex h-12 items-center gap-3 rounded-xl border border-white/12 bg-background px-4">
          <Search size={18} aria-hidden="true" className="text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Rechercher une chaîne, une source, une action…"
            aria-label="Rechercher"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <Badge>Échap</Badge>
        </div>

        <div ref={listRef} role="listbox" aria-label="Résultats" className="mt-1 max-h-[50vh] overflow-y-auto">
          {items.map((it, i) => {
            const header = it.group !== lastGroup ? it.group : null;
            lastGroup = it.group;
            const Icon = it.icon;
            return (
              <div key={it.id}>
                {header && <div className="px-3 pb-1.5 pt-3.5 text-xs uppercase tracking-widest text-muted-foreground">{header}</div>}
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  data-index={i}
                  onMouseMove={() => setActive(i)}
                  onClick={it.run}
                  className={cn('flex h-11 w-full items-center gap-3 rounded-btn px-3 text-left text-[15px] outline-none', i === active && 'bg-secondary')}
                >
                  <span className="grid size-7 place-items-center rounded-lg bg-background text-muted-foreground"><Icon size={14} aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1 truncate">{it.label}</span>
                  <span className="text-[13px] text-muted-foreground">{it.hint}</span>
                </button>
              </div>
            );
          })}
          {items.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted-foreground">Aucun résultat.</p>}
        </div>

        <div className="flex gap-5 px-3 pt-3.5 text-[13px] text-muted-foreground">
          <span>↑ ↓ naviguer</span><span>↵ ouvrir</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
