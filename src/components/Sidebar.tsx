/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Tv, Heart, Filter, Grid, List as ListIcon, Sparkles, ChevronDown, MapPin, Film } from 'lucide-react';
import { IPTVChannel } from '../types/iptv';
import { motion, AnimatePresence } from 'motion/react';
import { PORTAL_SOURCES, PlaylistSource } from '../constants/portal_data';

interface SidebarProps {
  channels: IPTVChannel[];
  selectedChannel: IPTVChannel | null;
  onChannelSelect: (channel: IPTVChannel) => void;
  isLoading: boolean;
  channelStatus: Record<string, 'checking' | 'active' | 'dead'>;
  onLoadPlaylist: (url: string) => void;
}

export default function Sidebar({ 
  channels, 
  selectedChannel, 
  onChannelSelect, 
  isLoading, 
  channelStatus,
  onLoadPlaylist,
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

  return (
    <aside className="w-full md:w-80 h-[40vh] md:h-full bg-app-card border-b md:border-b-0 md:border-r border-app-border flex flex-col overflow-hidden transition-colors duration-300">
      <div className="p-4 border-b border-app-border space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher une chaîne..."
            className="w-full bg-app-bg border border-app-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-app-text focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all placeholder:text-zinc-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-zinc-500 font-bold" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Auto Filter</span>
          </div>
          <button 
            onClick={() => setShowOnlyWorking(!showOnlyWorking)}
            className={`text-[10px] font-black px-2 py-0.5 rounded transition-colors uppercase tracking-widest border ${
              showOnlyWorking 
                ? 'bg-brand-primary/10 text-brand-secondary border-brand-primary/30' 
                : 'bg-zinc-800 text-zinc-500 border-transparent'
            }`}
          >
            {showOnlyWorking ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
              filter === 'all' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-app-card hover:bg-zinc-800 dark:hover:bg-zinc-800 text-app-text-muted hover:text-app-text border border-app-border'
            }`}
          >
            Toutes
          </button>
          {groups.map(group => (
            <button
              key={group}
              onClick={() => setFilter(group)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                filter === group ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-app-card hover:bg-zinc-800 dark:hover:bg-zinc-800 text-app-text-muted hover:text-app-text border border-app-border'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="w-8 h-8 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 text-sm">Chargement...</p>
          </div>
        ) : filteredChannels.length > 0 ? (
          <div className="flex flex-col gap-1">
            <AnimatePresence initial={false}>
              {filteredChannels.map((channel, idx) => {
                const status = channelStatus[channel.url] || 'checking';
                
                return (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 1) }}
                    key={channel.id + idx}
                    onClick={() => onChannelSelect(channel)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                      selectedChannel?.url === channel.url
                        ? 'bg-brand-primary/10 border border-brand-primary/30 text-app-text'
                        : 'hover:bg-zinc-800/10 dark:hover:bg-zinc-800/50 text-app-text-muted border border-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center relative">
                      {channel.logo ? (
                        <img 
                          src={channel.logo} 
                          alt={channel.name} 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="text-zinc-600"><Tv size={20} /></div>';
                          }}
                        />
                      ) : (
                        <Tv size={20} className="text-zinc-600" />
                      )}
                      
                      {/* Health Indicator */}
                      <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-900 ${
                        status === 'active' ? 'bg-green-500' : 
                        status === 'dead' ? 'bg-brand-primary' : 'bg-yellow-500 animate-pulse'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${selectedChannel?.url === channel.url ? 'text-app-text' : 'group-hover:text-app-text'}`}>
                        {channel.name}
                      </p>
                      <p className="text-[10px] text-app-text-muted truncate uppercase tracking-wider">
                        {channel.group || 'Général'}
                      </p>
                    </div>
                    {selectedChannel?.url === channel.url && (
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse shadow-[0_0_8px_rgba(173,1,185,0.8)]" />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <Search size={32} className="text-zinc-700 mb-2" />
            <p className="text-zinc-500 text-sm italic">Aucune chaîne trouvée</p>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-app-bg border-t border-app-border flex flex-col gap-2 transition-colors duration-300">
        <div className="flex justify-between items-center text-[10px] text-app-text-muted font-bold uppercase tracking-widest">
          <span>{filteredChannels.length} CHAÎNES</span>
          <span className="flex items-center gap-1 text-app-text-muted">
            LIVE <div className="w-1 h-1 rounded-full bg-green-500" />
          </span>
        </div>
        <div className="text-[10px] text-app-text-muted italic text-center border-t border-app-border pt-2 flex items-center justify-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
          Accès facilité par le Facilitateur
        </div>
      </div>
    </aside>
  );
}
