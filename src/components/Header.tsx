/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Download, ChevronDown, Globe, Film, MapPin, Search, LayoutGrid, Radio, Grid2x2, Flame, Lock, ShieldCheck, Tv, AlertCircle, Plus, Trash2, Link, FileUp, X as XIcon, BarChart2, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PORTAL_SOURCES, PlaylistSource, getCustomPlaylists, saveCustomPlaylist, deleteCustomPlaylist } from '../constants/portal_data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useTheme } from '../context/ThemeContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const { theme, toggleTheme } = useTheme();
  
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
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const SECRET_CODE = 'GbLEWA';

  // Canal+ State
  const [isCanalOpen, setIsCanalOpen] = useState(false);
  const [canalInput, setCanalInput] = useState('');
  const [canalError, setCanalError] = useState(false);
  const CANAL_SECRET = 'Th3 fAc1liTat0R';
  const CANAL_DOWNLOAD_URL = 'https://drive.google.com/uc?export=download&id=1Yg7g2xJXt6oIV04YME4OYAEMqgHBPYZO';

  // Import Playlist State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importTab, setImportTab] = useState<'url' | 'file'>('url');
  const [importUrl, setImportUrl] = useState('');
  const [importName, setImportName] = useState('');
  const [importError, setImportError] = useState('');
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

  const handleAdultClick = () => {
    setIsPasscodeOpen(true);
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === SECRET_CODE) {
      onLoadPlaylist(adultUrl);
      setIsPasscodeOpen(false);
      setPasscodeInput('');
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
      setPasscodeInput('');
    }
  };

  const handleCanalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canalInput === CANAL_SECRET) {
      window.open(CANAL_DOWNLOAD_URL, '_blank');
      setIsCanalOpen(false);
      setCanalInput('');
      setCanalError(false);
    } else {
      setCanalError(true);
      setCanalInput('');
    }
  };

  const handleImportSubmit = (url: string, name: string) => {
    if (!url.trim()) {
      setImportError('Veuillez entrer une URL valide');
      return;
    }
    if (!url.startsWith('http') && !url.startsWith('blob:')) {
      setImportError('L\'URL doit commencer par http:// ou https://');
      return;
    }
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
    setImportUrl('');
    setImportName('');
    setImportError('');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const blob = new Blob([content], { type: 'text/plain' });
      const blobUrl = URL.createObjectURL(blob);
      const name = file.name.replace('.m3u', '').replace('.m3u8', '');
      handleImportSubmit(blobUrl, name);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset to allow selecting the same file again
  };

  return (
    <>
      <header className={`${isMobileLandscape ? 'h-10' : 'h-16 md:h-20'} bg-card/80 backdrop-blur-md border-b border-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <img 
                src="https://image.noelshack.com/fichiers/2026/22/2/1779829245-moo-dy.png" 
                alt="Moody Logo" 
                className={`${isMobileLandscape ? 'h-4' : 'h-6 md:h-8'} w-auto object-contain brightness-110`}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* Country Selector Button */}
            <div className="relative">
              <Button
                variant={isPortalOpen ? "secondary" : "ghost"}
                onClick={() => setIsPortalOpen(!isPortalOpen)}
                className="flex items-center gap-1.5 xl:gap-2 rounded-xl text-[10px] xl:text-xs px-2 xl:px-4 h-8 xl:h-10"
              >
                <MapPin size={14} className="text-muted-foreground" />
                COUNTRY
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isPortalOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            <Button
              variant={isAfricaActive ? "secondary" : "ghost"}
              onClick={() => onLoadPlaylist(africaUrl)}
              disabled={isLoading}
              className="flex items-center gap-1.5 xl:gap-2 rounded-xl text-[10px] xl:text-xs px-2 xl:px-4 h-8 xl:h-10 font-bold"
            >
              <Globe size={14} className={isAfricaActive ? 'text-foreground' : 'text-muted-foreground'} />
              AFRICA
              {isLoading && isAfricaActive && <div className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin ml-1" />}
            </Button>

            <Button
              variant={isEuropaActive ? "secondary" : "ghost"}
              onClick={() => onLoadPlaylist(europaUrl)}
              disabled={isLoading}
              className="flex items-center gap-1.5 xl:gap-2 rounded-xl text-[10px] xl:text-xs px-2 xl:px-4 h-8 xl:h-10 font-bold"
            >
              <MapPin size={14} className={isEuropaActive ? 'text-foreground' : 'text-muted-foreground'} />
              EUROPA
              {isLoading && isEuropaActive && <div className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin ml-1" />}
            </Button>

            <Button
              variant={isWorldActive ? "secondary" : "ghost"}
              onClick={() => onLoadPlaylist(worldUrl)}
              disabled={isLoading}
              className="flex items-center gap-1.5 xl:gap-2 rounded-xl text-[10px] xl:text-xs px-2 xl:px-4 h-8 xl:h-10 font-bold"
            >
              <Search size={14} className={isWorldActive ? 'text-foreground' : 'text-muted-foreground'} />
              WORLD
              {isLoading && isWorldActive && <div className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin ml-1" />}
            </Button>

            <Button
              variant={isRegionalActive ? "secondary" : "ghost"}
              onClick={() => onLoadPlaylist(regionalUrl)}
              disabled={isLoading}
              className="flex items-center gap-1.5 xl:gap-2 rounded-xl text-[10px] xl:text-xs px-2 xl:px-4 h-8 xl:h-10 font-bold"
            >
              <LayoutGrid size={14} className={isRegionalActive ? 'text-foreground' : 'text-muted-foreground'} />
              REGIONAL
              {isLoading && isRegionalActive && <div className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin ml-1" />}
            </Button>

            <Button
              variant={isAdultActive ? "destructive" : "ghost"}
              onClick={handleAdultClick}
              disabled={isLoading}
              className={`flex items-center gap-1.5 xl:gap-2 rounded-xl text-[10px] xl:text-xs px-2 xl:px-4 h-8 xl:h-10 font-bold ${!isAdultActive && 'hover:text-destructive hover:bg-destructive/10'}`}
            >
              <Flame size={14} />
              XXX ADULT
              {isLoading && isAdultActive && <div className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full animate-spin ml-1" />}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setIsCanalOpen(true)}
              disabled={isLoading}
              className="flex items-center gap-1.5 xl:gap-2 rounded-xl text-[10px] xl:text-xs px-2 xl:px-4 h-8 xl:h-10 font-bold"
            >
              <Tv size={14} className="text-muted-foreground" />
              CANAL+
            </Button>

            <Button
              variant="ghost"
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5 xl:gap-2 rounded-xl text-[10px] xl:text-xs px-2 xl:px-4 h-8 xl:h-10 font-bold"
            >
              <Plus size={14} className="text-muted-foreground" /> IMPORT
            </Button>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl h-8 w-8 xl:h-10 xl:w-10"
              title="Changer le thème"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Quick Access buttons */}
          <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto scrollbar-none pr-2">
            <button
              onClick={toggleTheme}
              className="flex-shrink-0 p-2 rounded-lg transition-all active:scale-95 bg-card text-muted-foreground hover:text-foreground"
              title="Changer le thème"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={onToggleSplitView}
              className={`flex-shrink-0 p-2 rounded-lg transition-all active:scale-95 ${
                isSplitView ? 'bg-card text-white' : 'bg-card text-muted-foreground'
              }`}
              title="Mode Multi-écran"
            >
              <Grid2x2 size={18} />
            </button>
            <button
              onClick={() => setIsPortalOpen(!isPortalOpen)}
              className={`flex-shrink-0 p-2 rounded-lg transition-all active:scale-95 ${
                isPortalOpen ? 'bg-card text-white' : 'bg-card text-muted-foreground'
              }`}
            >
              <MapPin size={18} />
            </button>
            <button
              onClick={() => onLoadPlaylist(africaUrl)}
              disabled={isLoading}
              className={`flex-shrink-0 p-2 rounded-lg transition-all active:scale-95 ${
                isAfricaActive 
                  ? 'bg-white/10 text-white' 
                  : 'bg-zinc-900 text-zinc-500'
              }`}
            >
              <Globe size={18} />
            </button>
            <button
              onClick={() => onLoadPlaylist(europaUrl)}
              disabled={isLoading}
              className={`flex-shrink-0 p-2 rounded-lg transition-all active:scale-95 ${
                isEuropaActive 
                  ? 'bg-white/10 text-white' 
                  : 'bg-zinc-900 text-zinc-500'
              }`}
            >
              <MapPin size={18} />
            </button>
            <button
              onClick={() => onLoadPlaylist(worldUrl)}
              disabled={isLoading}
              className={`flex-shrink-0 p-2 rounded-lg transition-all active:scale-95 ${
                isWorldActive 
                  ? 'bg-white/10 text-white' 
                  : 'bg-zinc-900 text-zinc-500'
              }`}
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => onLoadPlaylist(regionalUrl)}
              disabled={isLoading}
              className={`flex-shrink-0 p-2 rounded-lg transition-all active:scale-95 ${
                isRegionalActive 
                  ? 'bg-white/10 text-white' 
                  : 'bg-zinc-900 text-zinc-500'
              }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={handleAdultClick}
              disabled={isLoading}
              className={`flex-shrink-0 p-2 rounded-lg transition-all active:scale-95 ${
                isAdultActive 
                  ? 'bg-white/10 text-white' 
                  : 'bg-zinc-900 text-zinc-500'
              }`}
            >
              <Flame size={18} />
            </button>
            <button
              onClick={() => setIsCanalOpen(true)}
              disabled={isLoading}
              className="flex-shrink-0 p-2 rounded-lg transition-all active:scale-95 bg-zinc-900 text-zinc-500"
            >
              <Tv size={18} />
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex-shrink-0 p-2 rounded-lg transition-all active:scale-95 bg-zinc-900 border-zinc-800 text-zinc-500 border"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={onToggleSplitView}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider ${
                isSplitView 
                  ? 'bg-white/10 text-white' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Grid2x2 size={14} /> {isSplitView ? 'QUITTER MULTI' : 'MULTI-ÉCRAN'}
            </button>

            <span className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-[0.2em]">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              SYSTEM LIVE
            </span>
          </div>
        </div>

        {isPortalOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsPortalOpen(false)} />
            <div className="absolute top-full left-4 lg:left-[180px] w-[calc(100vw-2rem)] md:w-72 max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-200 origin-top">
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3 h-3" />
                  <input
                    autoFocus
                    type="text"
                    placeholder={`Chercher ${portalTab === 'Country' ? 'pays' : 'genre'}...`}
                    aria-label={`Chercher ${portalTab === 'Country' ? 'pays' : 'genre'}`}
                    className="w-full bg-background border-none rounded-lg py-2 pl-9 pr-4 text-xs text-foreground focus:ring-2 focus:ring-white/50 outline-none"
                    value={portalSearch}
                    onChange={(e) => setPortalSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-1 bg-background flex gap-1 mx-1 mt-1 rounded-lg">
                <button
                  onClick={() => { setPortalTab('Country'); setPortalSearch(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-colors ${portalTab === 'Country' ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  PAYS
                </button>
                <button
                  onClick={() => { setPortalTab('Genre'); setPortalSearch(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-colors ${portalTab === 'Genre' ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  GENRES
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar grid grid-cols-1 gap-1">
                {filteredPortals.map((source) => (
                  <button
                    key={source.url}
                    onClick={() => handlePortalSelect(source)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-background transition-all text-left group"
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

              {customPlaylists.length > 0 && (
                <div className="border-t border-border p-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-2 py-1">Mes Playlists</p>
                  {customPlaylists.map((pl) => (
                    <div key={pl.url} className="flex items-center gap-2 p-2 rounded-xl hover:bg-background group">
                      <button
                        onClick={() => { onLoadPlaylist(pl.url); setIsPortalOpen(false); }}
                        className="flex-1 text-left text-[11px] font-bold text-zinc-400 group-hover:text-white truncate"
                      >
                        {pl.name}
                      </button>
                      <button
                        onClick={() => {
                          deleteCustomPlaylist(pl.url);
                          setCustomPlaylists(getCustomPlaylists());
                        }}
                        className="p-1 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </header>

      {isPasscodeOpen && (
        <Dialog open={isPasscodeOpen} onOpenChange={setIsPasscodeOpen}>
          <DialogContent className="sm:max-w-md bg-[#080808] border-white/10 rounded-[32px] p-10 md:p-14 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="flex flex-col items-center gap-8 w-full">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-white/10 to-zinc-900 rounded-[24px] flex items-center justify-center text-white border border-white/20">
                  <Lock size={36} strokeWidth={1.5} />
                </div>
              </div>
              
              <div className="space-y-4 text-center">
                <DialogTitle className="text-2xl font-light text-white tracking-tight uppercase leading-none italic">
                  Section <span className="text-white font-black not-italic">ADULTE</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Saisissez le code secret pour confirmer votre âge et accéder au contenu.
                </DialogDescription>
              </div>

              <form onSubmit={handlePasscodeSubmit} className="w-full flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <Input 
                    autoFocus
                    type="password"
                    placeholder="••••••••"
                    value={passcodeInput}
                    onChange={(e) => {
                      setPasscodeInput(e.target.value);
                      setPasscodeError(false);
                    }}
                    className={`h-16 text-center text-3xl font-black tracking-[0.4em] bg-white/5 border-2 ${passcodeError ? 'border-destructive text-destructive' : 'border-white/5 focus-visible:ring-0 focus-visible:border-white/40'} rounded-2xl`}
                  />
                  
                  <div className="h-4 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {passcodeError && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-2 text-destructive"
                        >
                          <AlertCircle size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Code invalide</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <Button 
                  type="submit"
                  size="lg"
                  className="w-full bg-white hover:bg-zinc-200 text-black text-[11px] font-black uppercase tracking-[0.4em] h-14 rounded-2xl shadow-xl flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
                  DÉVERROUILLER
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isImportOpen && (
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogContent className="sm:max-w-md bg-[#080808] border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-white/10 to-zinc-900 rounded-[24px] flex items-center justify-center text-white border border-white/20">
                  <Plus size={28} strokeWidth={2} />
                </div>
              </div>

              <div className="space-y-2 text-center w-full">
                <DialogTitle className="text-xl font-bold text-white tracking-tight uppercase">
                  Importer une Playlist
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500 font-medium">
                  Ajoutez vos propres chaînes via URL ou fichier M3U.
                </DialogDescription>
              </div>

              <Tabs value={importTab} onValueChange={(v) => setImportTab(v as 'url'|'file')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 p-1 rounded-[16px] h-12">
                  <TabsTrigger value="url" className="rounded-xl text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-black text-zinc-500 transition-all">
                    <Link size={14} className="mr-2" /> URL
                  </TabsTrigger>
                  <TabsTrigger value="file" className="rounded-xl text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-black text-zinc-500 transition-all">
                    <FileUp size={14} className="mr-2" /> Fichier
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="mt-0">
                  <div className="flex flex-col gap-4">
                    <div className="space-y-3">
                      <Input type="text" placeholder="Nom de la playlist (optionnel)"
                        value={importName} onChange={(e) => setImportName(e.target.value)}
                        className="h-14 bg-white/5 border-2 border-white/5 rounded-2xl px-5 text-sm text-white focus-visible:ring-0 focus-visible:border-white/40 transition-all placeholder:text-zinc-600" />
                      <Input type="url" placeholder="https://exemple.com/playlist.m3u"
                        value={importUrl} onChange={(e) => { setImportUrl(e.target.value); setImportError(''); }}
                        className="h-14 bg-white/5 border-2 border-white/5 rounded-2xl px-5 text-sm text-white focus-visible:ring-0 focus-visible:border-white/40 transition-all placeholder:text-zinc-600" />
                    </div>
                    {importError && (
                      <div className="flex items-center gap-2 text-destructive mt-1 justify-center">
                        <AlertCircle size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{importError}</span>
                      </div>
                    )}
                    <Button
                      onClick={() => handleImportSubmit(importUrl, importName)}
                      size="lg"
                      className="w-full bg-white hover:bg-zinc-200 text-black text-[11px] font-black uppercase tracking-[0.2em] h-14 rounded-2xl shadow-xl flex items-center justify-center gap-2 group mt-2 transition-all">
                      <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                      CHARGER LA PLAYLIST
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="file" className="mt-0">
                  <label className="flex flex-col items-center justify-center gap-4 p-8 h-[220px] border-2 border-dashed border-white/10 rounded-[24px] cursor-pointer hover:border-white/30 hover:bg-white/5 transition-all group">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all">
                      <FileUp size={24} className="text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-center space-y-1.5">
                      <p className="text-sm text-white font-bold tracking-wide">Parcourir les fichiers</p>
                      <p className="text-xs text-zinc-500 font-medium tracking-wide">Formats acceptés : .m3u, .m3u8</p>
                    </div>
                    <input type="file" accept=".m3u,.m3u8" className="hidden" onChange={handleFileImport} />
                  </label>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isCanalOpen && (
        <Dialog open={isCanalOpen} onOpenChange={setIsCanalOpen}>
          <DialogContent className="sm:max-w-md bg-[#080808] border-white/10 rounded-[32px] p-10 md:p-14 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="flex flex-col items-center gap-8 w-full">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-white/10 to-zinc-900 rounded-[24px] flex items-center justify-center text-white border border-white/20">
                  <Tv size={36} strokeWidth={1.5} />
                </div>
              </div>
              
              <div className="space-y-4 text-center">
                <DialogTitle className="text-2xl font-light text-white tracking-tight uppercase leading-none italic">
                  Accès <span className="text-white font-black not-italic">CANAL+</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Saisissez le code secret pour déverrouiller le téléchargement.
                </DialogDescription>
              </div>

              <form onSubmit={handleCanalSubmit} className="w-full flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <Input 
                    autoFocus
                    type="password"
                    placeholder="••••••••"
                    value={canalInput}
                    onChange={(e) => {
                      setCanalInput(e.target.value);
                      setCanalError(false);
                    }}
                    className={`h-16 text-center text-3xl font-black tracking-[0.4em] bg-white/5 border-2 ${canalError ? 'border-destructive text-destructive' : 'border-white/5 focus-visible:ring-0 focus-visible:border-white/40'} rounded-2xl`}
                  />
                  
                  <div className="h-4 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {canalError && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-2 text-destructive"
                        >
                          <AlertCircle size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Code invalide</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <Button 
                  type="submit"
                  size="lg"
                  className="w-full bg-white hover:bg-zinc-200 text-black text-[11px] font-black uppercase tracking-[0.4em] h-14 rounded-2xl shadow-xl flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <Download size={18} className="group-hover:scale-110 transition-transform" />
                  VALIDER ET TÉLÉCHARGER
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
