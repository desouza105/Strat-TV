/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Tv, Filter, MapPin, X } from 'lucide-react';
import { IPTVChannel } from '../types/iptv';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  channels: IPTVChannel[];
  selectedChannel: IPTVChannel | null;
  onChannelSelect: (channel: IPTVChannel) => void;
  isLoading: boolean;
  channelStatus: Record<string, 'checking' | 'active' | 'dead'>;
  isMobileLandscape?: boolean;
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
  isOpen = false,
  onClose
}: SidebarProps) {
  const [filter, setFilter] = useState<string>('all');
  const [showOnlyWorking, setShowOnlyWorking] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const groups = useMemo(() => {
    const g = new Set<string>();
    channels.forEach(c => {
      if (c.group) g.add(c.group);
    });
    return Array.from(g).sort();
  }, [channels]);

  const filteredChannels = useMemo(() => {
    return channels.filter(c => {
      const matchGroup = filter === 'all' || c.group === filter;
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
        className={`bg-card flex flex-col overflow-hidden transition-all duration-300 ${
          isMobileLandscape 
            ? `fixed inset-y-0 left-0 z-50 w-80 h-full border-r border-border ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'w-full md:w-80 h-[45vh] md:h-full border-t md:border-t-0 md:border-r border-border order-2 md:order-1'
        }`}
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
        <div className={`p-4 border-b border-border space-y-4 ${isMobileLandscape ? 'pt-12' : ''}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une chaîne..."
              aria-label="Rechercher une chaîne"
              className="w-full bg-background border border-border rounded-xl py-2 pl-9 pr-4 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-border outline-none transition-all placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Filter size={14} className="font-bold" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">Auto Filter</span>
            </div>
            <button 
              onClick={() => setShowOnlyWorking(!showOnlyWorking)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors uppercase tracking-widest ${
                showOnlyWorking 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              {showOnlyWorking ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Chargement des chaînes...</p>
            </div>
          ) : filteredChannels.length > 0 ? (
            <div className="flex flex-col gap-1" onKeyDown={handleListKeyDown}>
              <AnimatePresence initial={false}>
                {filteredChannels.map((channel, idx) => {
                  const status = channelStatus[channel.url] || 'checking';
                  const isSelected = selectedChannel?.url === channel.url;
                  
                  return (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 1), type: "spring", bounce: 0, duration: 0.4 }}
                      key={channel.id + idx}
                      id={`channel-btn-${idx}`}
                      tabIndex={focusedIndex === idx ? 0 : -1}
                      onFocus={() => setFocusedIndex(idx)}
                      onClick={() => onChannelSelect(channel)}
                      className={`flex items-center gap-3 p-2 rounded-xl transition-all text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center relative bg-background rounded-lg border border-border shadow-sm overflow-hidden">
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
                        <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-[2px] border-background ${
                          status === 'active' ? 'bg-green-500' : 
                          status === 'dead' ? 'bg-destructive' : 'bg-yellow-500 animate-pulse'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate transition-colors ${isSelected ? 'text-foreground' : 'group-hover:text-foreground'}`}>
                          {channel.name}
                        </p>
                        <p className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-wider">
                          {channel.group || 'Général'}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
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

        <div className="px-4 py-3 bg-background border-t border-border flex flex-col gap-2 transition-colors duration-300">
          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
            <span>{filteredChannels.length} CHAÎNES</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              LIVE <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground/60 text-center border-t border-border/50 pt-2 flex items-center justify-center gap-1.5 transition-opacity">
            Accès facilité par le Facilitateur
          </div>
        </div>
      </aside>
    </>
  );
}
