/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Download, ChevronDown, Globe, Film, MapPin, Search, LayoutGrid, Radio, Grid2x2, Flame, Lock, ShieldCheck, Tv, AlertCircle, Plus, Trash2, Link, FileUp, X as XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PORTAL_SOURCES, PlaylistSource, getCustomPlaylists, saveCustomPlaylist, deleteCustomPlaylist } from '../constants/portal_data';
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
  const adultUrl = 'https://ip-tv.app/XXX';
  
  const isAfricaActive = currentPlaylistName === 'Afrique TV';
  const isEuropaActive = currentPlaylistName === 'Europa TV';
  const isWorldActive = currentPlaylistName === 'World TV';
  const isRegionalActive = currentPlaylistName === 'Regional TV';
  const isRadioActive = currentPlaylistName === 'Radio';
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
      <header className="h-16 md:h-20 bg-app-card/80 backdrop-blur-md border-b border-app-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <img 
                src="https://image.noelshack.com/fichiers/2026/22/2/1779829245-moo-dy.png" 
                alt="Moody Logo" 
                className="h-6 md:h-8 w-auto object-contain brightness-110"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {/* Country Selector Button */}
            <div className="relative">
              <button
                onClick={() => setIsPortalOpen(!isPortalOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-normal transition-all active:scale-95 ${
                  isPortalOpen 
                    ? 'bg-app-card text-app-text shadow-lg shadow-white/10' 
                    : 'bg-app-card text-app-text-muted hover:bg-zinc-800 hover:text-app-text'
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
                          className="w-full bg-app-bg border-none rounded-lg py-2 pl-9 pr-4 text-xs text-app-text focus:ring-2 focus:ring-white/50 outline-none"
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

                    {customPlaylists.length > 0 && (
                      <div className="border-t border-app-border p-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-2 py-1">Mes Playlists</p>
                        {customPlaylists.map((pl) => (
                          <div key={pl.url} className="flex items-center gap-2 p-2 rounded-xl hover:bg-app-bg group">
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
            </div>

            <button
              onClick={() => onLoadPlaylist(africaUrl)}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isAfricaActive 
                  ? 'bg-white/10 text-white' 
                  : 'bg-app-card text-app-text-muted hover:bg-zinc-800 hover:text-app-text'
              }`}
            >
              <Globe size={14} className={isAfricaActive ? 'text-white' : 'text-zinc-500'} />
              AFRICA
              {isLoading && isAfricaActive && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin ml-1" />}
            </button>

            <button
              onClick={() => onLoadPlaylist(europaUrl)}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isEuropaActive 
                  ? 'bg-white/10 text-white' 
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <MapPin size={14} className={isEuropaActive ? 'text-white' : 'text-zinc-500'} />
              EUROPA
              {isLoading && isEuropaActive && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin ml-1" />}
            </button>

            <button
              onClick={() => onLoadPlaylist(worldUrl)}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isWorldActive 
                  ? 'bg-white/10 text-white' 
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Search size={14} className={isWorldActive ? 'text-white' : 'text-zinc-500'} />
              WORLD
              {isLoading && isWorldActive && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin ml-1" />}
            </button>

            <button
              onClick={() => onLoadPlaylist(regionalUrl)}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isRegionalActive 
                  ? 'bg-white/10 text-white' 
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <LayoutGrid size={14} className={isRegionalActive ? 'text-white' : 'text-zinc-500'} />
              REGIONAL
              {isLoading && isRegionalActive && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin ml-1" />}
            </button>

            <button
              onClick={() => onLoadPlaylist(radioUrl)}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isRadioActive 
                  ? 'bg-white/10 text-white' 
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Radio size={14} className={isRadioActive ? 'text-white' : 'text-zinc-500'} />
              RADIO
              {isLoading && isRadioActive && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin ml-1" />}
            </button>

            <button
              onClick={handleAdultClick}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isAdultActive 
                  ? 'bg-white/10 text-white' 
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Flame size={14} className={isAdultActive ? 'text-white' : 'text-zinc-500'} />
              XXX ADULT
              {isLoading && isAdultActive && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin ml-1" />}
            </button>

            <button
              onClick={() => setIsCanalOpen(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <Tv size={14} className="text-zinc-500" />
              CANAL+
            </button>

            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white border"
            >
              <Plus size={14} /> IMPORT
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Quick Access buttons */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onToggleSplitView}
              className={`p-2 rounded-lg transition-all active:scale-95 ${
                isSplitView ? 'bg-app-card text-white' : 'bg-app-card text-app-text-muted'
              }`}
              title="Mode Multi-écran"
            >
              <Grid2x2 size={18} />
            </button>
            <button
              onClick={() => setIsPortalOpen(!isPortalOpen)}
              className={`p-2 rounded-lg transition-all active:scale-95 ${
                isPortalOpen ? 'bg-app-card text-white' : 'bg-app-card text-app-text-muted'
              }`}
            >
              <MapPin size={18} />
            </button>
            <button
              onClick={() => onLoadPlaylist(africaUrl)}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all active:scale-95 ${
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
              className={`p-2 rounded-lg transition-all active:scale-95 ${
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
              className={`p-2 rounded-lg transition-all active:scale-95 ${
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
              className={`p-2 rounded-lg transition-all active:scale-95 ${
                isRegionalActive 
                  ? 'bg-white/10 text-white' 
                  : 'bg-zinc-900 text-zinc-500'
              }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => onLoadPlaylist(radioUrl)}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all active:scale-95 ${
                isRadioActive 
                  ? 'bg-white/10 text-white' 
                  : 'bg-zinc-900 text-zinc-500'
              }`}
            >
              <Radio size={18} />
            </button>
            <button
              onClick={handleAdultClick}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all active:scale-95 ${
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
              className="p-2 rounded-lg transition-all active:scale-95 bg-zinc-900 text-zinc-500"
            >
              <Tv size={18} />
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="p-2 rounded-lg transition-all active:scale-95 bg-zinc-900 border-zinc-800 text-zinc-500 border"
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
      </header>

      {createPortal(
        <AnimatePresence>
          {isPasscodeOpen && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center w-screen h-screen">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPasscodeOpen(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
              />
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  y: 0,
                  x: passcodeError ? [0, -15, 15, -15, 15, 0] : 0
                }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ 
                  type: "spring", 
                  bounce: 0, 
                  duration: 0.5,
                  x: { type: "tween", duration: 0.4 } 
                }}
                className="relative z-10 w-[min(440px,90%)] bg-[#080808] border border-white/10 rounded-[48px] p-10 md:p-14 shadow-[0_50px_100px_rgba(0,0,0,1)] flex flex-col items-center"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                
                <button 
                  onClick={() => setIsPasscodeOpen(false)}
                  className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 text-zinc-600 transition-all active:scale-90 z-20"
                  type="button"
                >
                  <XIcon size={24} />
                </button>

                <div className="flex flex-col items-center gap-10 w-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-150 animate-pulse" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-white/10 to-zinc-900 rounded-[32px] flex items-center justify-center text-white border border-white/20">
                      <Lock size={44} strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-center">
                    <h2 className="text-3xl font-light text-white tracking-tight uppercase leading-none italic">
                      Section <span className="text-white font-black not-italic">ADULTE</span>
                    </h2>
                    <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[280px] font-medium">
                      Saisissez le code secret pour confirmer votre âge et accéder au contenu.
                    </p>
                  </div>

                  <form onSubmit={handlePasscodeSubmit} className="w-full flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                      <input 
                        autoFocus
                        type="password"
                        placeholder="••••••••"
                        value={passcodeInput}
                        onChange={(e) => {
                          setPasscodeInput(e.target.value);
                          setPasscodeError(false);
                        }}
                        className={`w-full bg-white/5 border-2 ${passcodeError ? 'border-white text-white' : 'border-white/5 focus:border-white/40'} rounded-2xl py-6 px-4 text-center text-4xl font-black tracking-[0.4em] outline-none transition-all placeholder:text-zinc-800 shadow-inner`}
                      />
                      
                      <div className="h-4 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          {passcodeError && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2 text-white"
                            >
                              <AlertCircle size={12} />
                              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Code de sécurité invalide</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-white hover:bg-zinc-200 text-black text-[11px] font-black uppercase tracking-[0.4em] py-5 rounded-2xl transition-all active:scale-95 shadow-2xl shadow-black/40 flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                      <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                      DÉVERROUILLER
                    </button>
                  </form>

                  <div className="flex items-center gap-3 opacity-20">
                    <div className="w-8 h-[1px] bg-white" />
                    <p className="text-[9px] text-white font-black uppercase tracking-widest">Parental Protection</p>
                    <div className="w-8 h-[1px] bg-white" />
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {isImportOpen && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center w-screen h-screen">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsImportOpen(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                className="relative z-10 w-[min(480px,90%)] bg-[#080808] border border-white/10 rounded-[32px] p-8 md:p-10 shadow-[0_50px_100px_rgba(0,0,0,1)]"
              >
                <button onClick={() => setIsImportOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-zinc-600 transition-all">
                  <XIcon size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-tight">
                  Importer une Playlist
                </h2>

                {/* Tabs URL / Fichier */}
                <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6">
                  <button onClick={() => setImportTab('url')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${importTab === 'url' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    <Link size={14} /> URL
                  </button>
                  <button onClick={() => setImportTab('file')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${importTab === 'file' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    <FileUp size={14} /> FICHIER .M3U
                  </button>
                </div>

                {importTab === 'url' ? (
                  <div className="flex flex-col gap-4">
                    <input type="text" placeholder="Nom de la playlist (optionnel)"
                      value={importName}
                      onChange={(e) => setImportName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-white/30 outline-none placeholder:text-zinc-600" />
                    <input type="url" placeholder="https://exemple.com/playlist.m3u"
                      value={importUrl}
                      onChange={(e) => { setImportUrl(e.target.value); setImportError(''); }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-white/30 outline-none placeholder:text-zinc-600" />
                    {importError && (
                      <p className="text-xs text-red-400">{importError}</p>
                    )}
                    <button
                      onClick={() => handleImportSubmit(importUrl, importName)}
                      className="w-full bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-widest py-4 rounded-xl transition-all active:scale-95">
                      CHARGER LA PLAYLIST
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-white/30 hover:bg-white/5 transition-all">
                    <FileUp size={32} className="text-zinc-500" />
                    <div className="text-center">
                      <p className="text-sm text-white font-bold">
                        Cliquez pour choisir un fichier
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Formats acceptés : .m3u, .m3u8
                      </p>
                    </div>
                    <input type="file" accept=".m3u,.m3u8" className="hidden" onChange={handleFileImport} />
                  </label>
                )}
              </motion.div>
            </div>
          )}

          {isCanalOpen && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center w-screen h-screen">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCanalOpen(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
              />
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  y: 0,
                  x: canalError ? [0, -15, 15, -15, 15, 0] : 0
                }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ 
                  type: "spring", 
                  bounce: 0, 
                  duration: 0.5,
                  x: { type: "tween", duration: 0.4 } 
                }}
                className="relative z-10 w-[min(440px,90%)] bg-[#080808] border border-white/10 rounded-[48px] p-10 md:p-14 shadow-[0_50px_100px_rgba(0,0,0,1)] flex flex-col items-center"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                
                <button 
                  onClick={() => setIsCanalOpen(false)}
                  className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 text-zinc-600 transition-all active:scale-90 z-20"
                  type="button"
                >
                  <XIcon size={24} />
                </button>

                <div className="flex flex-col items-center gap-10 w-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-150 animate-pulse" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-white/10 to-zinc-900 rounded-[32px] flex items-center justify-center text-white border border-white/20">
                      <Tv size={44} strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-center">
                    <h2 className="text-3xl font-light text-white tracking-tight uppercase leading-none italic">
                      Accès <span className="text-white font-black not-italic">CANAL+</span>
                    </h2>
                    <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[280px] font-medium">
                      Saisissez le code secret pour déverrouiller le téléchargement.
                    </p>
                  </div>

                  <form onSubmit={handleCanalSubmit} className="w-full flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                      <input 
                        autoFocus
                        type="password"
                        placeholder="••••••••"
                        value={canalInput}
                        onChange={(e) => {
                          setCanalInput(e.target.value);
                          setCanalError(false);
                        }}
                        className={`w-full bg-white/5 border-2 ${canalError ? 'border-white text-white' : 'border-white/5 focus:border-white/40'} rounded-2xl py-6 px-4 text-center text-2xl font-black outline-none transition-all placeholder:text-zinc-800 shadow-inner`}
                      />
                      
                      <div className="h-4 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          {canalError && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex items-center gap-2 text-white"
                            >
                              <AlertCircle size={12} />
                              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Code de validation invalide</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-white hover:bg-zinc-200 text-black text-[11px] font-black uppercase tracking-[0.4em] py-5 rounded-2xl transition-all active:scale-95 shadow-2xl shadow-black/20 flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                      <Download size={20} className="group-hover:scale-110 transition-transform" />
                      VALIDER ET TÉLÉCHARGER
                    </button>
                  </form>

                  <div className="flex items-center gap-3 opacity-20">
                    <div className="w-8 h-[1px] bg-white" />
                    <p className="text-[9px] text-white font-black uppercase tracking-widest">Secured Access</p>
                    <div className="w-8 h-[1px] bg-white" />
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
