/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Tv, Filter, Grid as GridIcon, MapPin } from 'lucide-react';
import { IPTVChannel } from '../types/iptv';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
}: SidebarProps) {
  const [filter, setFilter] = useState<string>('all');
  const [showOnlyWorking, setShowOnlyWorking] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  
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
    <aside className="w-full md:w-80 h-[40vh] md:h-full bg-card border-b md:border-b-0 md:border-r border-border flex flex-col overflow-hidden transition-colors duration-300">
      <div className="p-4 border-b border-border space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher une chaîne..."
            className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:ring-2 focus:ring-white/30 outline-none transition-all placeholder:text-zinc-600"
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
            className={`text-[10px] font-black px-2 py-0.5 rounded transition-colors uppercase tracking-widest ${
              showOnlyWorking 
                ? 'bg-white/10 text-white' 
                : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {showOnlyWorking ? 'ON' : 'OFF'}
          </button>
        </div>

        <Button 
          variant="secondary"
          className="w-full flex items-center justify-between rounded-xl h-10"
          onClick={() => setIsCategoriesOpen(true)}
        >
          <div className="flex items-center gap-2">
            <GridIcon size={16} />
            <span className="font-bold">Catégories</span>
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">
            {filter === 'all' ? 'Toutes' : filter}
          </span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                    transition={{ delay: Math.min(idx * 0.02, 1), type: "spring", bounce: 0, duration: 0.4 }}
                    key={channel.id + idx}
                    onClick={() => onChannelSelect(channel)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                      selectedChannel?.url === channel.url
                        ? 'bg-white/10 text-foreground'
                        : 'hover:bg-zinc-800/10 dark:hover:bg-zinc-800/50 text-muted-foreground'
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
                            e.currentTarget.parentElement!.innerHTML = '<div class="text-zinc-600"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tv"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg></div>';
                          }}
                        />
                      ) : (
                        <Tv size={20} className="text-zinc-600" />
                      )}
                      
                      {/* Health Indicator */}
                      <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-900 ${
                        status === 'active' ? 'bg-white' : 
                        status === 'dead' ? 'bg-zinc-600' : 'bg-zinc-400 animate-pulse'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${selectedChannel?.url === channel.url ? 'text-foreground' : 'group-hover:text-foreground'}`}>
                        {channel.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">
                        {channel.group || 'Général'}
                      </p>
                    </div>
                    {selectedChannel?.url === channel.url && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
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

      <div className="px-4 py-3 bg-background border-t border-border flex flex-col gap-2 transition-colors duration-300">
        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
          <span>{filteredChannels.length} CHAÎNES</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            LIVE <div className="w-1 h-1 rounded-full bg-white" />
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground italic text-center border-t border-border pt-2 flex items-center justify-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
          Accès facilité par le Facilitateur
        </div>
      </div>

      <Dialog open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-border shadow-2xl p-6 md:p-8 max-h-[85vh] flex flex-col">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
              <GridIcon size={24} className="text-primary" />
              Catégories de chaînes
            </DialogTitle>
            <DialogDescription>
              Sélectionnez une catégorie pour filtrer la liste des chaînes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                className="h-auto py-4 flex flex-col items-center justify-center gap-2 rounded-2xl"
                onClick={() => {
                  setFilter('all');
                  setIsCategoriesOpen(false);
                }}
              >
                <GridIcon size={24} className={filter === 'all' ? 'text-primary-foreground text-opacity-80' : 'text-muted-foreground'} />
                <span className="font-bold text-xs uppercase tracking-wider">Toutes les chaînes</span>
              </Button>
              
              {groups.map((group) => {
                const count = channels.filter(c => c.group === group).length;
                return (
                  <Button
                    key={group}
                    variant={filter === group ? 'default' : 'outline'}
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2 rounded-2xl"
                    onClick={() => {
                      setFilter(group);
                      setIsCategoriesOpen(false);
                    }}
                  >
                    <Tv size={24} className={filter === group ? 'text-primary-foreground text-opacity-80' : 'text-muted-foreground'} />
                    <div className="text-center">
                      <span className="font-bold text-xs uppercase tracking-wider block truncate max-w-[120px]">{group}</span>
                      <span className={`text-[10px] font-medium tracking-widest uppercase mt-1 block ${filter === group ? 'text-primary-foreground text-opacity-70' : 'text-muted-foreground'}`}>{count} chaînes</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
