/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Download, ChevronDown, Globe, Film, MapPin, Search, LayoutGrid, Radio, Grid2x2 } from 'lucide-react';
import { PORTAL_SOURCES, PlaylistSource } from '../constants/portal_data';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onLoadPlaylist: (url: string) => void;
  isLoading: boolean;
  currentPlaylistName: string;
  isSplitView: boolean;
  onToggleSplitView: () => void;
}

export default function Header({ onLoadPlaylist, isLoading, currentPlaylistName, isSplitView, onToggleSplitView }: HeaderProps) {
  const africaUrl = 'https://tvradiozap.eu/live/d/tvzaf.m3u';
  const europaUrl = 'https://tvradiozap.eu/live/d/tvzeu.m3u';
  const worldUrl = 'https://tvradiozap.eu/live/d/tvrztv.m3u';
  const regionalUrl = 'https://tvradiozap.eu/live/d/tvzreg.m3u';
  const radioUrl = 'https://tvradiozap.eu/live/x/vlc/d/tvrzra.m3u';
  
  const isAfricaActive = currentPlaylistName === 'Afrique TV';
  const isEuropaActive = currentPlaylistName === 'Europa TV';
  const isWorldActive = currentPlaylistName === 'World TV';
  const isRegionalActive = currentPlaylistName === 'Regional TV';
  const isRadioActive = currentPlaylistName === 'Radio';

  // Country Selector State
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [portalTab, setPortalTab] = useState<'Country' | 'Genre'>('Country');
  const [portalSearch, setPortalSearch] = useState('');

  const filteredPortals = useMemo(() => {
    return PORTAL_SOURCES.filter(s => 
      s.category === portalTab && 
      s.name.toLowerCase().includes(portalSearch.toLowerCase())
    );
  }, [portalTab, portalSearch]);

  const handlePortalSelect = (source: PlaylistSource) => {
    onLoadPlaylist(source.url);
    setIsPortalOpen(false);
    setPortalSearch('');
  };

  return (
    <header className="h-16 md:h-20 bg-app-card/80 backdrop-blur-md border-b border-app-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <img 
              src="https://image.noelshack.com/fichiers/2026/17/2/1776790858-1774711504-w-1920-quality-90-fit-scale-down.png" 
              alt="Strat TV Logo" 
              className="w-8 h-8 md:w-10 md:h-10 object-contain brightness-110 drop-shadow-[0_0_8px_rgba(173,1,185,0.3)]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-normal bg-gradient-to-r from-app-text via-app-text-muted to-app-text-muted bg-clip-text text-transparent tracking-tighter leading-none">
              Strat <span className="text-brand-secondary">TV</span>
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {/* Country Selector Button */}
          <div className="relative">
            <button
              onClick={() => setIsPortalOpen(!isPortalOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-normal transition-all active:scale-95 border-2 ${
                isPortalOpen 
                  ? 'border-brand-primary bg-app-card text-app-text shadow-lg shadow-brand-primary/10' 
                  : 'bg-app-card border-app-border text-app-text-muted hover:bg-zinc-800 dark:hover:bg-zinc-800 hover:text-app-text'
              }`}
            >
              <MapPin size={14} className="text-zinc-500" />
              COUNTRY
              <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${isPortalOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPortalOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsPortalOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-72 max-h-[80vh] bg-app-card border border-app-border rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-200 origin-top">
                  <div className="p-3 border-b border-app-border">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted w-3 h-3" />
                      <input
                        autoFocus
                        type="text"
                        placeholder={`Chercher ${portalTab === 'Country' ? 'pays' : 'genre'}...`}
                        className="w-full bg-app-bg border-none rounded-lg py-2 pl-9 pr-4 text-xs text-app-text focus:ring-2 focus:ring-brand-primary outline-none"
                        value={portalSearch}
                        onChange={(e) => setPortalSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-1 bg-app-bg flex gap-1 mx-1 mt-1 rounded-lg">
                    <button
                      onClick={() => { setPortalTab('Country'); setPortalSearch(''); }}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-colors ${portalTab === 'Country' ? 'bg-app-card text-app-text' : 'text-app-text-muted hover:text-app-text'}`}
                    >
                      PAYS
                    </button>
                    <button
                      onClick={() => { setPortalTab('Genre'); setPortalSearch(''); }}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-colors ${portalTab === 'Genre' ? 'bg-app-card text-app-text' : 'text-app-text-muted hover:text-app-text'}`}
                    >
                      GENRES
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 custom-scrollbar grid grid-cols-1 gap-1">
                    {filteredPortals.map((source) => (
                      <button
                        key={source.url}
                        onClick={() => handlePortalSelect(source)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-app-bg transition-all text-left group"
                      >
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center overflow-hidden transition-colors">
                          {source.code ? (
                            <img 
                              src={`https://flagcdn.com/w40/${source.code}.png`} 
                              alt={source.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Film size={14} className="text-zinc-600" />
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-zinc-400 group-hover:text-white truncate">
                          {source.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => onLoadPlaylist(africaUrl)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
              isAfricaActive 
                ? 'bg-brand-primary/20 border-brand-primary text-brand-secondary' 
                : 'bg-app-card border-app-border text-app-text-muted hover:bg-zinc-800 hover:text-app-text'
            }`}
          >
            <Globe size={14} className={isAfricaActive ? 'text-brand-secondary' : 'text-zinc-500'} />
            AFRICA
            {isLoading && isAfricaActive && <div className="w-3 h-3 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin ml-1" />}
          </button>

          <button
            onClick={() => onLoadPlaylist(europaUrl)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
              isEuropaActive 
                ? 'bg-brand-primary/20 border-brand-primary text-brand-secondary' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <MapPin size={14} className={isEuropaActive ? 'text-brand-secondary' : 'text-zinc-500'} />
            EUROPA
            {isLoading && isEuropaActive && <div className="w-3 h-3 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin ml-1" />}
          </button>

          <button
            onClick={() => onLoadPlaylist(worldUrl)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
              isWorldActive 
                ? 'bg-brand-primary/20 border-brand-primary text-brand-secondary' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <Search size={14} className={isWorldActive ? 'text-brand-secondary' : 'text-zinc-500'} />
            WORLD
            {isLoading && isWorldActive && <div className="w-3 h-3 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin ml-1" />}
          </button>

          <button
            onClick={() => onLoadPlaylist(regionalUrl)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
              isRegionalActive 
                ? 'bg-brand-primary/20 border-brand-primary text-brand-secondary' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <LayoutGrid size={14} className={isRegionalActive ? 'text-brand-secondary' : 'text-zinc-500'} />
            REGIONAL
            {isLoading && isRegionalActive && <div className="w-3 h-3 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin ml-1" />}
          </button>

          <button
            onClick={() => onLoadPlaylist(radioUrl)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
              isRadioActive 
                ? 'bg-brand-primary/20 border-brand-primary text-brand-secondary' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <Radio size={14} className={isRadioActive ? 'text-brand-secondary' : 'text-zinc-500'} />
            RADIO
            {isLoading && isRadioActive && <div className="w-3 h-3 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin ml-1" />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Quick Access buttons */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={onToggleSplitView}
            className={`p-2 rounded-lg transition-all active:scale-95 border ${
              isSplitView ? 'border-brand-primary bg-app-card text-brand-secondary' : 'bg-app-card border-app-border text-app-text-muted'
            }`}
            title="Mode Multi-écran"
          >
            <Grid2x2 size={18} />
          </button>
          <button
            onClick={() => setIsPortalOpen(!isPortalOpen)}
            className={`p-2 rounded-lg transition-all active:scale-95 border ${
              isPortalOpen ? 'border-brand-primary bg-app-card text-app-text' : 'bg-app-card border-app-border text-app-text-muted'
            }`}
          >
            <MapPin size={18} />
          </button>
          <button
            onClick={() => onLoadPlaylist(africaUrl)}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all active:scale-95 border ${
              isAfricaActive 
                ? 'bg-brand-primary/20 border-brand-primary text-brand-secondary' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            <Globe size={18} />
          </button>
          <button
            onClick={() => onLoadPlaylist(europaUrl)}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all active:scale-95 border ${
              isEuropaActive 
                ? 'bg-brand-primary/20 border-brand-primary text-brand-secondary' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            <MapPin size={18} />
          </button>
          <button
            onClick={() => onLoadPlaylist(worldUrl)}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all active:scale-95 border ${
              isWorldActive 
                ? 'bg-brand-primary/20 border-brand-primary text-brand-secondary' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            <Search size={18} />
          </button>
          <button
            onClick={() => onLoadPlaylist(regionalUrl)}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all active:scale-95 border ${
              isRegionalActive 
                ? 'bg-brand-primary/20 border-brand-primary text-brand-secondary' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => onLoadPlaylist(radioUrl)}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all active:scale-95 border ${
              isRadioActive 
                ? 'bg-brand-primary/20 border-brand-primary text-brand-secondary' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            <Radio size={18} />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={onToggleSplitView}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold uppercase tracking-wider ${
              isSplitView 
                ? 'bg-brand-primary/20 border-brand-primary text-brand-secondary' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Grid2x2 size={14} /> {isSplitView ? 'QUITTER MULTI' : 'MULTI-ÉCRAN'}
          </button>

          <span className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-[0.2em]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            SYSTEM LIVE
          </span>
        </div>
      </div>
    </header>
  );
}
