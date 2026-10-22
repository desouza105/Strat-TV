import { Home, Compass, Tv, LayoutGrid, Activity, Search, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AppView = 'home' | 'explore' | 'player' | 'settings';

interface NavRailProps {
  view: AppView;
  isSplitView: boolean;
  onNavigate: (view: AppView) => void;
  onOpenMosaic: () => void;
  onOpenStats: () => void;
  onOpenSearch: () => void;
}

/** Rail de navigation latérale (maquettes V3) : icônes carrées de 44 px, coins 12 px. */
export default function NavRail({ view, isSplitView, onNavigate, onOpenMosaic, onOpenStats, onOpenSearch }: NavRailProps) {
  const items = [
    { id: 'search', label: 'Rechercher (Ctrl K)', icon: Search, active: false, onClick: onOpenSearch },
    { id: 'home', label: 'Accueil', icon: Home, active: view === 'home', onClick: () => onNavigate('home') },
    { id: 'explore', label: 'Explorer', icon: Compass, active: view === 'explore', onClick: () => onNavigate('explore') },
    { id: 'player', label: 'Lecteur', icon: Tv, active: view === 'player' && !isSplitView, onClick: () => onNavigate('player') },
    { id: 'mosaic', label: 'Mosaïque', icon: LayoutGrid, active: view === 'player' && isSplitView, onClick: onOpenMosaic },
    { id: 'stats', label: 'Activité', icon: Activity, active: false, onClick: onOpenStats },
    { id: 'settings', label: 'Réglages', icon: Settings, active: view === 'settings', onClick: () => onNavigate('settings') },
  ];

  return (
    <nav
      aria-label="Navigation principale"
      className="flex w-full shrink-0 flex-row items-center justify-around gap-2 border-t border-border bg-background px-2 py-2 md:w-[88px] md:flex-col md:justify-start md:gap-3.5 md:border-t-0 md:px-0 md:py-7 order-last md:order-first"
    >
      <div className="mb-4 hidden text-[15px] font-bold md:block">
        S<span className="text-mint">·</span>TV
      </div>
      {items.map(({ id, label, icon: Icon, active, onClick }) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          aria-current={active ? 'page' : undefined}
          title={label}
          onClick={onClick}
          className={cn(
            'grid size-11 place-items-center rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
            active
              ? 'bg-gradient-to-br from-mint to-indigo-700 text-white'
              : 'bg-card text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon size={22} aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}
