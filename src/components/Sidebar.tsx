/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef, memo } from 'react';
import { Search, Tv, MapPin, X } from 'lucide-react';
import { IPTVChannel } from '../types/iptv';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Heart, ChevronDown, Check } from 'lucide-react';

interface ChannelRowProps {
  channel: IPTVChannel;
  idx: number;
  status: 'checking' | 'active' | 'dead';
  isSelected: boolean;
  fav: boolean;
  focused: boolean;
  onSelect: (channel: IPTVChannel) => void;
  onFocusIndex: (idx: number) => void;
  onToggleFavorite?: (channel: IPTVChannel) => void;
}

/** Ligne de chaîne mémoïsée : seule la ligne dont les props changent est re-rendue. */
const ChannelRow = memo(function ChannelRow({ channel, idx, status, isSelected, fav, focused, onSelect, onFocusIndex, onToggleFavorite }: ChannelRowProps) {
  return (
                    <div className="relative group/row [content-visibility:auto] [contain-intrinsic-size:auto_56px]">
                    <button
                      style={{ animationFillMode: "both", animationDelay: `${Math.min(idx * 20, 1000)}ms` }}
                      id={`channel-btn-${idx}`}
                      tabIndex={focused ? 0 : -1}
                      onFocus={() => onFocusIndex(idx)}
                      onClick={() => onSelect(channel)}
                      aria-label={`Sélectionner la chaîne ${channel.name}`} className={cn("animate-in fade-in slide-in-from-left-2 duration-300 flex w-full items-center gap-3 p-2 pr-11 rounded-btn transition-all text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary", 
                        isSelected
                          ? 'bg-secondary text-foreground'
                          : 'hover:bg-secondary/60 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center relative bg-secondary rounded-btn overflow-hidden">
                        {channel.logo ? (
                          <img 
                            src={channel.logo} 
                            alt={channel.name} 
                            className="w-full h-full object-contain p-1"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<div class="text-muted-foreground"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tv"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg></div>';
                            }}
                          />
                        ) : (
                          <Tv size={20} className="text-muted-foreground" />
                        )}
                        
                        {/* Health Indicator */}
                        <div className={cn("absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-card", 
                          status === 'active' ? 'bg-mint' : 
                          status === 'dead' ? 'bg-destructive' : 'bg-yellow-500'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold truncate transition-colors", isSelected ? "text-foreground" : "group-hover:text-foreground")}>
                          {channel.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {channel.group || 'Général'}
                        </p>
                      </div>
                      {isSelected ? (
                        <Badge variant="live">En cours</Badge>
                      ) : status === 'checking' ? (
                        <span className="text-xs text-muted-foreground">Vérification…</span>
                      ) : null}
                    </button>
                    {onToggleFavorite && (
                      <button
                        type="button"
                        aria-pressed={fav}
                        aria-label={fav ? `Retirer ${channel.name} des favoris` : `Ajouter ${channel.name} aux favoris`}
                        onClick={() => onToggleFavorite(channel)}
                        className={cn(
                          'absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-btn outline-none transition-opacity hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring/60',
                          fav ? 'text-mint' : 'text-muted-foreground md:opacity-0 md:group-hover/row:opacity-100 md:focus-visible:opacity-100'
                        )}
                      >
                        <Heart size={16} fill={fav ? 'currentColor' : 'none'} aria-hidden="true" />
                      </button>
                    )}
                    </div>
  );
});

interface SidebarProps {
  channels: IPTVChannel[];
  selectedChannel: IPTVChannel | null;
  onChannelSelect: (channel: IPTVChannel) => void;
  isLoading: boolean;
  channelStatus: Record<string, 'checking' | 'active' | 'dead'>;
  isMobileLandscape?: boolean;
  isFavorite?: (url: string) => boolean;
  onToggleFavorite?: (channel: IPTVChannel) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ 
  channels, 
  selectedChannel, 
  onChannelSelect, 
  isLoading, 
  channelStatus,
  isMobileLandscape = false,
  isFavorite,
  onToggleFavorite,
  isOpen = false,
  onClose
}: SidebarProps) {
  const [filter, setFilter] = useState<string>('all');
  const showOnlyWorking = true;
  const [searchQuery, setSearchQuery] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  
  const groups = useMemo(() => {
    const g = new Set<string>();
    channels.forEach(c => {
      if (c.group) g.add(c.group);
    });
    return Array.from(g).sort();
  }, [channels]);

  const groupCounts = useMemo(() => {
    const m: Record<string, number> = {};
    channels.forEach((c) => { if (c.group) m[c.group] = (m[c.group] || 0) + 1; });
    return m;
  }, [channels]);

  // Si la playlist change et que la catégorie choisie n'existe plus, on revient à « Toutes ».
  useEffect(() => {
    if (filter !== 'all' && filter !== '__fav__' && !groups.includes(filter)) setFilter('all');
  }, [groups, filter]);

  // Ferme le menu des catégories : clic à l'extérieur ou Échap.
  useEffect(() => {
    if (!catOpen) return;
    const onDown = (e: MouseEvent) => { if (!catRef.current?.contains(e.target as Node)) setCatOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setCatOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [catOpen]);

  const filteredChannels = useMemo(() => {
    return channels.filter(c => {
      const matchGroup = filter === 'all' || (filter === '__fav__' ? !!isFavorite?.(c.url) : c.group === filter);
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const isWorking = channelStatus[c.url] !== 'dead';
      
      if (showOnlyWorking) {
        return matchGroup && matchSearch && isWorking;
      }
      return matchGroup && matchSearch;
    });
  }, [channels, filter, channelStatus, showOnlyWorking, searchQuery]);

  const [focusedIndex, setFocusedIndex] = useState(0);

  // Sync index if selection changes from outside
  useEffect(() => {
    if (selectedChannel) {
      const idx = filteredChannels.findIndex(c => c.url === selectedChannel.url);
      if (idx !== -1) {
        setFocusedIndex(idx);
      }
    }
  }, [selectedChannel, filteredChannels]);

  // Keep index in bounds if list shrinks
  useEffect(() => {
    if (focusedIndex >= filteredChannels.length && filteredChannels.length > 0) {
      setFocusedIndex(filteredChannels.length - 1);
    }
  }, [filteredChannels.length, focusedIndex]);

  // Gamepad polling
  const focusedIndexRef = useRef(focusedIndex);
  useEffect(() => { focusedIndexRef.current = focusedIndex; }, [focusedIndex]);
  const filteredChannelsRef = useRef(filteredChannels);
  useEffect(() => { filteredChannelsRef.current = filteredChannels; }, [filteredChannels]);
  const onChannelSelectRef = useRef(onChannelSelect);
  useEffect(() => { onChannelSelectRef.current = onChannelSelect; }, [onChannelSelect]);

  useEffect(() => {
    let animationFrameId: number;
    const lastButtonState: Record<string, boolean> = {};

    const pollGamepad = () => {
      // Si on est en mode paysage mobile et que la sidebar est fermée, on ne gère pas la manette ici
      if (isMobileLandscape && !isOpen) {
        animationFrameId = requestAnimationFrame(pollGamepad);
        return;
      }

      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0];

      if (gp && filteredChannelsRef.current.length > 0) {
        // Bouton A (index 0)
        const isPressedA = gp.buttons[0]?.pressed;
        if (isPressedA && !lastButtonState['a']) {
          const channel = filteredChannelsRef.current[focusedIndexRef.current];
          if (channel) onChannelSelectRef.current(channel);
        }
        lastButtonState['a'] = isPressedA;

        // D-Pad et Joystick Gauche
        const isUp = gp.buttons[12]?.pressed || (gp.axes[1] && gp.axes[1] < -0.5);
        const isDown = gp.buttons[13]?.pressed || (gp.axes[1] && gp.axes[1] > 0.5);
        const isLeft = gp.buttons[14]?.pressed || (gp.axes[0] && gp.axes[0] < -0.5);
        const isRight = gp.buttons[15]?.pressed || (gp.axes[0] && gp.axes[0] > 0.5);

        let newIndex = focusedIndexRef.current;
        let moved = false;

        if (isDown && !lastButtonState['down']) {
          newIndex = Math.min(newIndex + 1, filteredChannelsRef.current.length - 1);
          moved = true;
        } else if (isUp && !lastButtonState['up']) {
          newIndex = Math.max(newIndex - 1, 0);
          moved = true;
        } else if (isRight && !lastButtonState['right']) {
          newIndex = Math.min(newIndex + 1, filteredChannelsRef.current.length - 1);
          moved = true;
        } else if (isLeft && !lastButtonState['left']) {
          newIndex = Math.max(newIndex - 1, 0);
          moved = true;
        }

        if (moved && newIndex !== focusedIndexRef.current) {
          setFocusedIndex(newIndex);
          const el = document.getElementById(`channel-btn-${newIndex}`);
          if (el) el.focus();
        }

        lastButtonState['up'] = isUp;
        lastButtonState['down'] = isDown;
        lastButtonState['left'] = isLeft;
        lastButtonState['right'] = isRight;
      }

      animationFrameId = requestAnimationFrame(pollGamepad);
    };

    animationFrameId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isMobileLandscape, isOpen]);

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (filteredChannels.length === 0) return;
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let newIndex = focusedIndex;
      
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        newIndex = Math.min(focusedIndex + 1, filteredChannels.length - 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        newIndex = Math.max(focusedIndex - 1, 0);
      }
      
      if (newIndex !== focusedIndex) {
        setFocusedIndex(newIndex);
        requestAnimationFrame(() => {
          const el = document.getElementById(`channel-btn-${newIndex}`);
          if (el) el.focus();
        });
      }
    }
  };

  return (
    <>
      {isMobileLandscape && isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 z-40 backdrop-blur-sm" 
          onClick={onClose}
        />
      )}
      <aside 
        className={cn("bg-card flex flex-col overflow-hidden transition-all duration-300 rounded-card border border-white/[0.06]", 
          isMobileLandscape 
            ? `fixed inset-y-0 left-0 z-50 w-80 h-full ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'w-full md:w-80 h-[60vh] shrink-0 md:shrink md:h-full order-2'
        )}
      >
        {isMobileLandscape && (
          <Button 
            variant="secondary"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 z-50 md:hidden rounded-full shadow-md"
            aria-label="Fermer la barre latérale"
          >
            <X size={18} />
          </Button>
        )}
        <div className={cn("p-4", isMobileLandscape && "pt-12")}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une chaîne..."
              aria-label="Rechercher une chaîne"
              className="h-9 w-full rounded-btn border border-input bg-background pl-9 pr-3 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {(groups.length > 0 || onToggleFavorite) && (
            <div ref={catRef} className="relative mt-3">
              <div role="group" aria-label="Filtrer les chaînes" className="flex gap-2">
                <button
                  type="button"
                  aria-pressed={filter === 'all'}
                  onClick={() => { setFilter('all'); setCatOpen(false); }}
                  className={cn('h-8 shrink-0 rounded-btn px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60', filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground')}
                >
                  Toutes
                </button>
                {onToggleFavorite && (
                  <button
                    type="button"
                    aria-pressed={filter === '__fav__'}
                    onClick={() => { setFilter('__fav__'); setCatOpen(false); }}
                    className={cn('h-8 shrink-0 rounded-btn px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60', filter === '__fav__' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground')}
                  >
                    Favoris
                  </button>
                )}
                {groups.length > 0 && (
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={catOpen}
                    onClick={() => setCatOpen((o) => !o)}
                    className={cn('h-8 shrink-0 rounded-btn px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 flex min-w-0 flex-1 items-center justify-between gap-2', groups.includes(filter) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground')}
                  >
                    <span className="truncate">{groups.includes(filter) ? filter : 'Catégories'}</span>
                    <ChevronDown size={14} aria-hidden="true" className={cn('shrink-0 transition-transform', catOpen && 'rotate-180')} />
                  </button>
                )}
              </div>

              {catOpen && (
                <div
                  role="listbox"
                  aria-label="Catégories"
                  className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-popover p-1.5 shadow-2xl custom-scrollbar"
                >
                  {groups.map((g) => (
                    <button
                      key={g}
                      type="button"
                      role="option"
                      aria-selected={filter === g}
                      onClick={() => { setFilter(g); setCatOpen(false); }}
                      className={cn('flex h-9 w-full items-center gap-2 rounded-btn px-3 text-left text-[13px] outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-ring/60', filter === g && 'bg-secondary')}
                    >
                      <span className="min-w-0 flex-1 truncate">{g}</span>
                      <span className="text-xs text-muted-foreground">{groupCounts[g]}</span>
                      {filter === g && <Check size={14} className="text-mint" aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 [mask-image:linear-gradient(to_bottom,transparent,black_12px,black_calc(100%-12px),transparent)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Chargement des chaînes...</p>
            </div>
          ) : filteredChannels.length > 0 ? (
            <div className="flex flex-col gap-1" onKeyDown={handleListKeyDown}>
                {filteredChannels.map((channel, idx) => {
                  const status = channelStatus[channel.url] || 'checking';
                  const isSelected = selectedChannel?.url === channel.url;
                  const fav = !!isFavorite?.(channel.url);
                  
                  return (
                    <ChannelRow
                      key={channel.id + idx}
                      channel={channel}
                      idx={idx}
                      status={status}
                      isSelected={isSelected}
                      fav={fav}
                      focused={focusedIndex === idx}
                      onSelect={onChannelSelect}
                      onFocusIndex={setFocusedIndex}
                      onToggleFavorite={onToggleFavorite}
                    />
                  );
                })}
              
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Search size={20} className="text-muted-foreground" />
              </div>
              <p className="text-foreground text-sm font-semibold">Aucune chaîne trouvée</p>
              <p className="text-muted-foreground text-xs mt-1">Modifiez vos filtres ou votre recherche.</p>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-card flex flex-col gap-2 transition-colors duration-300">
          <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
            <span>{filteredChannels.length} CHAÎNES</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              LIVE <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
