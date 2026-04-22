/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Download, ChevronDown, Globe, Film, MapPin, Search, LayoutGrid, Radio, Grid2x2, Flame, Lock, ShieldCheck, X as XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
      // Shake animation or similar feedback could go here
    }
  };

  return (
    <>
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

            <button
              onClick={handleAdultClick}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                isAdultActive 
                  ? 'bg-rose-500/10 border-rose-500/50 text-rose-500' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Flame size={14} className={isAdultActive ? 'text-rose-500' : 'text-zinc-500'} />
              XXX ADULT
              {isLoading && isAdultActive && <div className="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin ml-1" />}
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
            <button
              onClick={handleAdultClick}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all active:scale-95 border ${
                isAdultActive 
                  ? 'bg-rose-500/20 border-rose-500 text-rose-500' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              <Flame size={18} />
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
                  damping: 25, 
                  stiffness: 400,
                  x: { duration: 0.4 } 
                }}
                className="relative z-10 w-[min(440px,90%)] bg-[#080808] border border-white/10 rounded-[48px] p-10 md:p-14 shadow-[0_50px_100px_rgba(0,0,0,1)] flex flex-col items-center"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-600/50 to-transparent" />
                
                <button 
                  onClick={() => setIsPasscodeOpen(false)}
                  className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 text-zinc-600 transition-all active:scale-90 z-20"
                  type="button"
                >
                  <XIcon size={24} />
                </button>

                <div className="flex flex-col items-center gap-10 w-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-rose-600/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-rose-600/20 to-zinc-900 rounded-[32px] flex items-center justify-center text-rose-500 border border-rose-500/20">
                      <Lock size={44} strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-center">
                    <h2 className="text-3xl font-light text-white tracking-tight uppercase leading-none italic">
                      Section <span className="text-rose-600 font-black not-italic">ADULTE</span>
                    </h2>
                    <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[280px] font-medium">
                      Saisissez le code secret pour confirmer votre âge et accéder au contenu.
                    </p>
                  </div>

                  <form onSubmit={handlePasscodeSubmit} className="w-full space-y-8">
                    <div className="space-y-4 relative">
                      <input 
                        autoFocus
                        type="password"
                        placeholder="••••••••"
                        value={passcodeInput}
                        onChange={(e) => {
                          setPasscodeInput(e.target.value);
                          setPasscodeError(false);
                        }}
                        className={`w-full bg-white/5 border-2 ${passcodeError ? 'border-rose-600 text-rose-600' : 'border-white/5 focus:border-rose-600/40'} rounded-2xl py-6 px-4 text-center text-4xl font-black tracking-[0.4em] outline-none transition-all placeholder:text-zinc-800 shadow-inner`}
                      />
                      
                      <AnimatePresence mode="wait">
                        {passcodeError && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute -bottom-10 left-0 w-full flex items-center justify-center gap-2 text-rose-600"
                          >
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Code Invalide</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black uppercase tracking-[0.4em] py-5 rounded-2xl transition-all active:scale-95 shadow-2xl shadow-rose-900/40 flex items-center justify-center gap-3 group relative overflow-hidden"
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
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
