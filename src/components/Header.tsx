/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Download, ChevronDown, Globe, MapPin, Search, LayoutGrid, Grid2x2, Flame, Lock, ShieldCheck, Tv, AlertCircle, Plus, Trash2, Link, FileUp, X as XIcon, BarChart2, Contrast, Menu, Play } from 'lucide-react';
import { PORTAL_SOURCES, PlaylistSource, getCustomPlaylists, saveCustomPlaylist, deleteCustomPlaylist } from '../constants/portal_data';
import { useMediaQuery } from '../hooks/useMediaQuery';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PinCodeDialog } from './dialogs/PinCodeDialog';
import { ImportPlaylistDialog } from './dialogs/ImportPlaylistDialog';

interface HeaderProps {
  onLoadPlaylist: (url: string) => void;
  isLoading: boolean;
  currentPlaylistName: string;
  isSplitView: boolean;
  onToggleSplitView: () => void;
  onOpenStats?: () => void;
}

export default function Header({ onLoadPlaylist, isLoading, currentPlaylistName, isSplitView, onToggleSplitView, onOpenStats }: HeaderProps) {
  
  const isMobileLandscape = useMediaQuery('(orientation: landscape) and (max-height: 500px)');
  
  const africaUrl = 'https://tvradiozap.eu/live/d/tvzaf.m3u';
  const europaUrl = 'https://tvradiozap.eu/live/d/tvzeu.m3u';
  const worldUrl = 'https://tvradiozap.eu/live/d/tvrztv.m3u';
  const regionalUrl = 'https://tvradiozap.eu/live/d/tvzreg.m3u';
  const adultUrl = 'https://ip-tv.app/XXX';
  
  const isAfricaActive = currentPlaylistName === 'Afrique TV';
  const isEuropaActive = currentPlaylistName === 'Europa TV';
  const isWorldActive = currentPlaylistName === 'World TV';
  const isRegionalActive = currentPlaylistName === 'Regional TV';
  const isAdultActive = currentPlaylistName === 'XXX ADULT';

  // Country Selector State
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [portalTab, setPortalTab] = useState<'Country' | 'Genre'>('Country');
  const [portalSearch, setPortalSearch] = useState('');

  // Passcode State
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const SECRET_CODE = 'GbLEWA';

  // High Contrast State
  const [isHighContrast, setIsHighContrast] = useState(() => {
    return localStorage.getItem('moody-high-contrast') === 'true';
  });

  React.useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('moody-high-contrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('moody-high-contrast', 'false');
    }
  }, [isHighContrast]);

  // Canal+ State
  const [isCanalOpen, setIsCanalOpen] = useState(false);
  const CANAL_SECRET = 'Th3 fAc1liTat0R';
  const CANAL_DOWNLOAD_URL = 'https://drive.google.com/uc?export=download&id=1Yg7g2xJXt6oIV04YME4OYAEMqgHBPYZO';

  // Import Playlist State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [customPlaylists, setCustomPlaylists] = useState<PlaylistSource[]>(
    () => getCustomPlaylists()
  );

  const filteredPortals = useMemo(() => {
    return PORTAL_SOURCES.filter(s => 
      s.category === portalTab && 
      s.name.toLowerCase().includes(portalSearch.toLowerCase())
    );
  }, [portalTab, portalSearch]);

  const handlePortalSelect = (source: PlaylistSource) => {
    if (source.name === 'XXX ADULT') {
      setIsPasscodeOpen(true);
      return;
    }
    onLoadPlaylist(source.url);
    setIsPortalOpen(false);
    setPortalSearch('');
  };

  const handleImportSubmit = (url: string, name: string) => {
    const playlist: PlaylistSource = {
      name: name.trim() || 'Ma Playlist',
      url: url.trim(),
      category: 'Country',
      code: '',
    };
    saveCustomPlaylist(playlist);
    setCustomPlaylists(getCustomPlaylists());
    onLoadPlaylist(url.trim());
    setIsImportOpen(false);
  };

  return (
    <>
      <header className={cn("bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300", isMobileLandscape ? "h-10" : "h-16 md:h-16")}>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2">
            <div className="relative">
              <Button
                variant={isPortalOpen ? "secondary" : "ghost"}
                onClick={() => setIsPortalOpen(!isPortalOpen)}
                className="flex items-center gap-2 rounded-xl text-xs px-4 h-10 font-semibold"
              >
                <MapPin size={16} className="text-muted-foreground" />
                COUNTRY
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isPortalOpen && "rotate-180")} />
              </Button>
            </div>

            <Button
              variant={isAfricaActive ? "secondary" : "ghost"}
              onClick={() => onLoadPlaylist(africaUrl)}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl text-xs px-4 h-10 font-semibold"
            >
              <Globe size={16} className={isAfricaActive ? 'text-foreground' : 'text-muted-foreground'} />
              AFRICA
              {isLoading && isAfricaActive && <div className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin ml-1" />}
            </Button>

            <Button
              variant={isEuropaActive ? "secondary" : "ghost"}
              onClick={() => onLoadPlaylist(europaUrl)}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl text-xs px-4 h-10 font-semibold"
            >
              <MapPin size={16} className={isEuropaActive ? 'text-foreground' : 'text-muted-foreground'} />
              EUROPA
              {isLoading && isEuropaActive && <div className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin ml-1" />}
            </Button>

            <Button
              variant={isWorldActive ? "secondary" : "ghost"}
              onClick={() => onLoadPlaylist(worldUrl)}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl text-xs px-4 h-10 font-semibold"
            >
              <Search size={16} className={isWorldActive ? 'text-foreground' : 'text-muted-foreground'} />
              WORLD
              {isLoading && isWorldActive && <div className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin ml-1" />}
            </Button>

            <Button
              variant={isRegionalActive ? "secondary" : "ghost"}
              onClick={() => onLoadPlaylist(regionalUrl)}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl text-xs px-4 h-10 font-semibold"
            >
              <LayoutGrid size={16} className={isRegionalActive ? 'text-foreground' : 'text-muted-foreground'} />
              REGIONAL
              {isLoading && isRegionalActive && <div className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin ml-1" />}
            </Button>

            <Button
              variant={isAdultActive ? "destructive" : "ghost"}
              onClick={() => setIsPasscodeOpen(true)}
              disabled={isLoading}
              className={cn("flex items-center gap-2 rounded-xl text-xs px-4 h-10 font-semibold", !isAdultActive && "hover:text-destructive hover:bg-destructive/10")}
            >
              <Flame size={16} />
              XXX ADULT
              {isLoading && isAdultActive && <div className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin ml-1" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex lg:hidden items-center gap-2 overflow-x-auto scrollbar-none">
            <Button variant={isSplitView ? "secondary" : "ghost"} size="icon" onClick={onToggleSplitView} className="h-10 w-10 shrink-0 rounded-xl">
              <Grid2x2 size={20} className={isSplitView ? 'text-foreground' : 'text-muted-foreground'} />
            </Button>
            <Button variant={isPortalOpen ? "secondary" : "ghost"} size="icon" onClick={() => setIsPortalOpen(!isPortalOpen)} className="h-10 w-10 shrink-0 rounded-xl">
              <Menu size={20} className={isPortalOpen ? 'text-foreground' : 'text-muted-foreground'} />
            </Button>
            <Button variant={isAfricaActive ? "secondary" : "ghost"} size="icon" onClick={() => onLoadPlaylist(africaUrl)} disabled={isLoading} className="h-10 w-10 shrink-0 rounded-xl">
              <Globe size={20} className={isAfricaActive ? 'text-foreground' : 'text-muted-foreground'} />
            </Button>
            <Button variant={isEuropaActive ? "secondary" : "ghost"} size="icon" onClick={() => onLoadPlaylist(europaUrl)} disabled={isLoading} className="h-10 w-10 shrink-0 rounded-xl">
              <MapPin size={20} className={isEuropaActive ? 'text-foreground' : 'text-muted-foreground'} />
            </Button>
            <Button variant={isWorldActive ? "secondary" : "ghost"} size="icon" onClick={() => onLoadPlaylist(worldUrl)} disabled={isLoading} className="h-10 w-10 shrink-0 rounded-xl">
              <Search size={20} className={isWorldActive ? 'text-foreground' : 'text-muted-foreground'} />
            </Button>
            <Button variant={isRegionalActive ? "secondary" : "ghost"} size="icon" onClick={() => onLoadPlaylist(regionalUrl)} disabled={isLoading} className="h-10 w-10 shrink-0 rounded-xl">
              <LayoutGrid size={20} className={isRegionalActive ? 'text-foreground' : 'text-muted-foreground'} />
            </Button>
            <Button variant={isAdultActive ? "destructive" : "ghost"} size="icon" onClick={() => setIsPasscodeOpen(true)} disabled={isLoading} className={cn("h-10 w-10 shrink-0 rounded-xl", !isAdultActive && "hover:bg-destructive/10 hover:text-destructive")}>
              <Flame size={20} className={isAdultActive ? 'text-foreground' : 'text-muted-foreground'} />
            </Button>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant={isSplitView ? "secondary" : "outline"}
              onClick={onToggleSplitView}
              className="flex items-center gap-2 rounded-xl text-xs h-10 font-semibold uppercase tracking-wider"
            >
              <Grid2x2 size={16} /> {isSplitView ? 'QUITTER MULTI' : 'MULTI-ÉCRAN'}
            </Button>
          </div>
        </div>

        {isPortalOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsPortalOpen(false)} />
            <div className="absolute top-full left-4 lg:left-6 w-[calc(100vw-2rem)] md:w-80 max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 origin-top animate-in fade-in slide-in-from-top-2 duration-200 mt-2">
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    autoFocus
                    type="text"
                    placeholder={`Chercher ${portalTab === 'Country' ? 'pays' : 'genre'}...`}
                    className="w-full bg-secondary border-transparent focus:bg-background focus:border-border focus:ring-1 focus:ring-primary rounded-xl py-2.5 pl-9 pr-4 text-sm text-foreground outline-none transition-all"
                    value={portalSearch}
                    onChange={(e) => setPortalSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-2 bg-background flex gap-2 mx-2 mt-2 rounded-xl border border-border">
                <Button
                  variant={portalTab === 'Country' ? "secondary" : "ghost"}
                  onClick={() => { setPortalTab('Country'); setPortalSearch(''); }}
                  className="flex-1 rounded-lg text-xs font-semibold uppercase tracking-wider h-9"
                >
                  PAYS
                </Button>
                <Button
                  variant={portalTab === 'Genre' ? "secondary" : "ghost"}
                  onClick={() => { setPortalTab('Genre'); setPortalSearch(''); }}
                  className="flex-1 rounded-lg text-xs font-semibold uppercase tracking-wider h-9"
                >
                  GENRES
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin grid grid-cols-1 gap-1">
                {filteredPortals.map((source) => (
                  <button
                    key={source.url}
                    onClick={() => handlePortalSelect(source)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left group"
                  >
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center overflow-hidden bg-muted rounded-md">
                      {source.code ? (
                        <img 
                          src={`https://flagcdn.com/w40/${source.code}.png`} 
                          alt={source.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Globe size={16} className="text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground truncate transition-colors">
                      {source.name}
                    </span>
                  </button>
                ))}
              </div>

              {customPlaylists.length > 0 && (
                <div className="border-t border-border p-2 bg-muted/30">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 py-2">Mes Playlists</p>
                  {customPlaylists.map((pl) => (
                    <div key={pl.url} className="flex items-center gap-2 p-2 rounded-xl hover:bg-secondary group transition-colors">
                      <button
                        onClick={() => { onLoadPlaylist(pl.url); setIsPortalOpen(false); }}
                        className="flex-1 text-left text-sm font-medium text-muted-foreground group-hover:text-foreground truncate px-1 transition-colors"
                      >
                        {pl.name}
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          deleteCustomPlaylist(pl.url);
                          setCustomPlaylists(getCustomPlaylists());
                        }}
                        className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </header>

      <PinCodeDialog
        isOpen={isPasscodeOpen}
        onOpenChange={setIsPasscodeOpen}
        onSuccess={() => onLoadPlaylist(adultUrl)}
        title={<span>Section <span className="font-bold">ADULTE</span></span>}
        description="Saisissez le code secret pour confirmer votre âge et accéder au contenu."
        secretCode={SECRET_CODE}
        icon={<Flame size={32} strokeWidth={1.5} />}
      />

      <ImportPlaylistDialog
        isOpen={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSubmit={handleImportSubmit}
      />

      <PinCodeDialog
        isOpen={isCanalOpen}
        onOpenChange={setIsCanalOpen}
        onSuccess={() => window.open(CANAL_DOWNLOAD_URL, '_blank')}
        title={<span>Accès <span className="font-bold">CANAL+</span></span>}
        description="Saisissez le code secret pour déverrouiller le téléchargement."
        secretCode={CANAL_SECRET}
        icon={<Tv size={32} strokeWidth={1.5} />}
      />
    </>
  );
}

