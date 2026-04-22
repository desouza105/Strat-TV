/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoPlayer, { VideoPlayerRef } from './components/VideoPlayer';
import SplashScreen from './components/SplashScreen';
import { IPTVChannel } from './types/iptv';
import { parseM3U } from './utils/m3uParser';
import { PORTAL_SOURCES } from './constants/portal_data';
import { Tv, WifiOff, Globe, Sparkles, MapPin, Grid2x2, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [currentPlaylistUrl, setCurrentPlaylistUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelStatus, setChannelStatus] = useState<Record<string, 'checking' | 'active' | 'dead'>>({});
  const [isAppLoading, setIsAppLoading] = useState(true);
  const playerRef = useRef<VideoPlayerRef>(null);

  // Split View States
  const [isSplitView, setIsSplitView] = useState(false);
  const [splitChannels, setSplitChannels] = useState<IPTVChannel[]>([]);
  const [activeSplitIndex, setActiveSplitIndex] = useState(0);

  const toggleSplitView = useCallback(() => {
    setIsSplitView(prev => {
      const next = !prev;
      if (next && selectedChannel && splitChannels.length === 0) {
        setSplitChannels([selectedChannel]);
      }
      return next;
    });
  }, [selectedChannel, splitChannels]);

  const handleChannelSelect = useCallback((channel: IPTVChannel) => {
    if (isSplitView) {
      setSplitChannels(prev => {
        const next = [...prev];
        if (next.length < 4 && !next.some(c => c.url === channel.url)) {
          // If less than 4, add new one if not empty slots
          if (next.length === 0) {
            return [channel];
          } else {
            // Replace active if set, otherwise add
            next[activeSplitIndex] = channel;
            return next;
          }
        } else {
          // Replaces active index
          next[activeSplitIndex] = channel;
          return next;
        }
      });
    } else {
      setSelectedChannel(channel);
    }
  }, [isSplitView, activeSplitIndex]);

  const removeSplitChannel = (index: number) => {
    setSplitChannels(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setIsSplitView(false);
      }
      return next;
    });
  };

  const expandSplitChannel = (channel: IPTVChannel) => {
    setSelectedChannel(channel);
    setIsSplitView(false);
    setSplitChannels([]);
  };

  const switchChannel = useCallback((direction: 'next' | 'prev') => {
    if (channels.length === 0 || !selectedChannel) return;
    const currentIndex = channels.findIndex(c => c.url === selectedChannel.url);
    if (currentIndex === -1) return;
    
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % channels.length;
    } else {
      nextIndex = (currentIndex - 1 + channels.length) % channels.length;
    }
    setSelectedChannel(channels[nextIndex]);
  }, [channels, selectedChannel]);

  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Keyboard shortcuts & Security
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = (e.target as HTMLElement).tagName === 'INPUT';
      
      // Security shortcuts
      if (e.key === 'F12') e.preventDefault();
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) e.preventDefault();
      if (e.ctrlKey && e.key === 'u') e.preventDefault();
      if (e.ctrlKey && e.key === 's') e.preventDefault();

      // App shortcuts (only if not in input)
      if (!isInput) {
        // Play/Pause
        if (e.code === 'Space') {
          e.preventDefault();
          playerRef.current?.togglePlay();
        }
        // Mute
        if (e.key.toLowerCase() === 'm') {
          playerRef.current?.toggleMute();
        }
        // Fullscreen
        if (e.key.toLowerCase() === 'f') {
          playerRef.current?.toggleFullscreen();
        }
        // Navigation
        if (e.key === 'ArrowRight') {
          switchChannel('next');
        }
        if (e.key === 'ArrowLeft') {
          switchChannel('prev');
        }
        // Volume 1-9
        if (/^[1-9]$/.test(e.key)) {
          const volumeValue = parseInt(e.key) / 10;
          playerRef.current?.setVolume(volumeValue);
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [channels, selectedChannel, switchChannel]);

  const playlistName = useMemo(() => {
    return PORTAL_SOURCES.find(s => s.url === currentPlaylistUrl)?.name || '';
  }, [currentPlaylistUrl]);

  const checkChannelsHealth = useCallback(async (channelList: IPTVChannel[]) => {
    // Initialize all as checking
    const initialStatus: Record<string, 'checking' | 'active' | 'dead'> = {};
    channelList.forEach(c => {
      initialStatus[c.url] = 'checking';
    });
    setChannelStatus(initialStatus);

    // Check in chunks to not overload the API or browser
    const chunkSize = 20;
    for (let i = 0; i < channelList.length; i += chunkSize) {
      const chunk = channelList.slice(i, i + chunkSize);
      const urls = chunk.map(c => c.url);

      try {
        const response = await fetch('/api/check-channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls })
        });

        if (response.ok) {
          const results = await response.json();
          setChannelStatus(prev => {
            const next = { ...prev };
            Object.keys(results).forEach(url => {
              next[url] = results[url] ? 'active' : 'dead';
            });
            return next;
          });
        } else {
          // If API fails (e.g. 404 on static hosting), mark all as active to not hide channels
          setChannelStatus(prev => {
            const next = { ...prev };
            urls.forEach(url => {
              next[url] = 'active';
            });
            return next;
          });
        }
      } catch (err) {
        console.error('Failed to check health for chunk', err);
        // Fallback to active on network error (likely API missing)
        setChannelStatus(prev => {
          const next = { ...prev };
          urls.forEach(url => {
            next[url] = 'active';
          });
          return next;
        });
      }
    }
  }, []);

  const loadPlaylist = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentPlaylistUrl(url);
    setChannelStatus({}); // Reset status
    try {
      // Use our internal proxy to avoid CORS issues
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      let response = await fetch(proxyUrl);
      
      if (!response.ok) {
        // Fallback to direct fetch if proxy fails for some reason
        response = await fetch(url);
        if (!response.ok) throw new Error('Impossible de charger la playlist IPTV');
      }

      const content = await response.text();
      const parsedChannels = parseM3U(content);
      
      if (parsedChannels.length === 0) {
        throw new Error('Aucune chaîne valide trouvée dans la playlist');
      }
      
      setChannels(parsedChannels);
      setSelectedChannel(parsedChannels[0]);

      // Start health check in background
      checkChannelsHealth(parsedChannels);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message.includes('Failed to fetch') 
          ? 'Erreur CORS : La playlist est inaccessible car le domaine source bloque les requêtes externes. Essayez une URL avec CORS activé.'
          : err.message
      );
    } finally {
      setIsLoading(false);
    }
  }, [checkChannelsHealth]);

  const handlePlayerError = useCallback((playerError: string) => {
    console.log('Player error:', playerError);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-app-bg text-app-text transition-colors duration-300 selection:bg-brand-primary/30">
      <AnimatePresence>
        {isAppLoading && (
          <SplashScreen onComplete={() => setIsAppLoading(false)} />
        )}
      </AnimatePresence>

      <Header 
        onLoadPlaylist={loadPlaylist} 
        isLoading={isLoading} 
        currentPlaylistName={playlistName}
        isSplitView={isSplitView}
        onToggleSplitView={toggleSplitView}
      />
      
      <main className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        <Sidebar 
          channels={channels} 
          selectedChannel={isSplitView ? splitChannels[activeSplitIndex] : selectedChannel} 
          onChannelSelect={handleChannelSelect} 
          isLoading={isLoading}
          channelStatus={channelStatus}
          onLoadPlaylist={loadPlaylist}
        />

        <section className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-app-bg relative overflow-y-auto custom-scrollbar transition-colors duration-300">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <AnimatePresence mode="wait">
            {isSplitView ? (
              <motion.div 
                key="split-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`grid gap-6 w-full max-w-7xl z-10 ${
                  splitChannels.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'
                }`}
              >
                {[0, 1, 2, 3].map((idx) => {
                  const channel = splitChannels[idx];
                  return (
                    <div 
                      key={idx}
                      onClick={() => setActiveSplitIndex(idx)}
                      className={`relative flex flex-col rounded-2xl overflow-hidden border-2 transition-all group ${
                        activeSplitIndex === idx ? 'border-brand-primary ring-4 ring-brand-primary/10 shadow-2xl' : 'border-app-border'
                      } ${!channel ? 'bg-app-card/50 border-dashed justify-center items-center cursor-pointer hover:bg-app-card' : 'bg-app-card'}`}
                    >
                      {channel ? (
                        <>
                          <div className="flex items-center justify-between p-3 bg-app-bg/50 border-b border-app-border">
                            <div className="flex items-center gap-2 max-w-[60%]">
                              {channel.logo && (
                                <img src={channel.logo} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                              )}
                              <span className="text-xs font-bold truncate uppercase">{channel.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); expandSplitChannel(channel); }}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-app-text-muted hover:text-app-text"
                                title="Agrandir"
                              >
                                <Maximize2 size={14} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeSplitChannel(idx); }}
                                className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 min-h-0">
                            <VideoPlayer 
                              url={channel.url} 
                              name={channel.name}
                              onError={handlePlayerError}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6 space-y-3 opacity-40 group-hover:opacity-100 transition-opacity">
                          <Grid2x2 className="w-10 h-10 mx-auto text-app-text-muted" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Zone Libre</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            ) : selectedChannel ? (
              <motion.div 
                key={selectedChannel.url}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-6xl z-10"
              >
                <VideoPlayer 
                  ref={playerRef}
                  url={selectedChannel.url} 
                  name={selectedChannel.name}
                  onError={handlePlayerError}
                />
                
                <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-2 tracking-tighter uppercase text-app-text">
                      {selectedChannel.name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm font-bold text-app-text-muted uppercase tracking-widest">
                       <span className="flex items-center gap-2 text-brand-secondary"><Globe size={14} /> DIRECT</span>
                       <span className="w-1.5 h-1.5 rounded-full bg-app-border" />
                       <span className="flex items-center gap-2"><MapPin size={14} className="text-app-text-muted" /> {playlistName || 'INTERNATIONAL'}</span>
                       <span className="w-1.5 h-1.5 rounded-full bg-app-border" />
                       <span className="text-app-text-muted">{selectedChannel.group || 'GÉNERAL'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="bg-app-card hover:bg-zinc-800 dark:hover:bg-zinc-800 p-2.5 rounded-full transition-colors text-app-text flex items-center justify-center overflow-hidden border border-app-border">
                       <img 
                         src="https://image.noelshack.com/fichiers/2026/17/2/1776790858-1774711504-w-1920-quality-90-fit-scale-down.png" 
                         alt="Action Logo" 
                         className="w-5 h-5 object-contain"
                         referrerPolicy="no-referrer"
                       />
                    </button>
                    <button className="bg-app-card hover:bg-zinc-800 px-6 py-2 rounded-xl text-sm font-bold border border-app-border text-app-text transition-all active:scale-95">
                      REPORT
                    </button>
                    <button className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 px-8 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-brand-primary/20">
                      LIVE
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md z-10"
              >
                {error ? (
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto border border-brand-primary/20">
                      <WifiOff className="text-brand-primary w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black uppercase text-white tracking-tight">Erreur de lecture</h3>
                      <p className="text-zinc-400 leading-relaxed text-sm">{error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full flex items-center justify-center mx-auto border border-brand-primary/20 relative z-10 text-brand-secondary">
                        <Tv className="w-12 h-12" />
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-primary/20 blur-[60px] rounded-full animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl md:text-4xl font-normal tracking-tighter text-app-text">Strat TV</h3>
                      <p className="text-app-text-muted text-sm leading-relaxed max-w-xs mx-auto">
                        Choisissez un pays ou une catégorie dans le menu supérieur pour accéder à vos chaînes préférées.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-app-border);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-brand-secondary);
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
