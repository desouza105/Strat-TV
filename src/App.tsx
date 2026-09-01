import { Routes, Route, useLocation } from "react-router-dom";
import { useGlobalPlayer } from "./context/GlobalPlayerContext";
import { Settings } from "./pages/Settings";
import { GlobalPlayer } from "./components/GlobalPlayer";

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
import { Tv, WifiOff, Globe, Sparkles, MapPin, Grid2x2, X, Maximize2, Timer, X as XIcon, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { addSession, WatchSession } from './utils/watchStats';
import StatsModal from './components/StatsModal';
import { useMediaQuery } from './hooks/useMediaQuery';

export default function App() {
  const isMobileLandscape = useMediaQuery('(orientation: landscape) and (max-height: 500px)');
  const [isLandscapeSidebarOpen, setIsLandscapeSidebarOpen] = useState(false);
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const { selectedChannel, setSelectedChannel, isSplitView, setIsSplitView, splitChannels, setSplitChannels, activeSplitIndex, setActiveSplitIndex } = useGlobalPlayer();
  const [currentPlaylistUrl, setCurrentPlaylistUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelStatus, setChannelStatus] = useState<Record<string, 'checking' | 'active' | 'dead'>>({});
  const [isAppLoading, setIsAppLoading] = useState(true);
  const playerRef = useRef<VideoPlayerRef>(null);

  // Watch Stats States
  const watchStartRef = useRef<number | null>(null);
  const watchChannelRef = useRef<IPTVChannel | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Split View States

  // Sleep Timer States
  const [sleepTimerActive, setSleepTimerActive] = useState(false);
  const [sleepTimerEnd, setSleepTimerEnd] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number>(0);
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadRequestIdRef = useRef(0);
  const location = useLocation();

  const abortControllerRef = useRef<AbortController | null>(null);

  const startSleepTimer = useCallback((minutes: number) => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    const end = Date.now() + minutes * 60 * 1000;
    setSleepTimerEnd(end);
    setSleepTimerActive(true);
    setSleepTimerRemaining(minutes * 60);
    
    sleepTimerRef.current = setInterval(() => {
      const remaining = Math.ceil((end - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(sleepTimerRef.current!);
        setSleepTimerActive(false);
        setSleepTimerEnd(null);
        setSleepTimerRemaining(0);
        setSelectedChannel(null);  // coupe la lecture
      } else {
        setSleepTimerRemaining(remaining);
      }
    }, 1000);
  }, []);

  const cancelSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    setSleepTimerActive(false);
    setSleepTimerEnd(null);
    setSleepTimerRemaining(0);
  }, []);

  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (watchStartRef.current && watchChannelRef.current) {
        const duration = Math.round(
          (Date.now() - watchStartRef.current) / 1000
        );
        addSession({
          channelName: watchChannelRef.current.name,
          channelGroup: watchChannelRef.current.group || 'Autre',
          startTime: watchStartRef.current,
          duration,
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const formatRemaining = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
        if (next.some(c => c.url === channel.url)) return next;

        if (next.length < 4) {
          next.push(channel);
          setActiveSplitIndex(next.length - 1);
          return next;
        } else {
          next[activeSplitIndex] = channel;
          return next;
        }
      });
    } else {
      // Enregistre la session précédente
      if (watchStartRef.current && watchChannelRef.current) {
        const duration = Math.round(
          (Date.now() - watchStartRef.current) / 1000
        );
        addSession({
          channelName: watchChannelRef.current.name,
          channelGroup: watchChannelRef.current.group || 'Autre',
          startTime: watchStartRef.current,
          duration,
        });
      }
      // Démarre la nouvelle session
      watchStartRef.current = Date.now();
      watchChannelRef.current = channel;
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

  const checkChannelsHealth = useCallback(async (channelList: IPTVChannel[], requestId: number) => {
    // Initialize all as checking
    const initialStatus: Record<string, 'checking' | 'active' | 'dead'> = {};
    channelList.forEach(c => {
      initialStatus[c.url] = 'checking';
    });
    setChannelStatus(initialStatus);

    // Check in chunks to not overload the API or browser
    const chunkSize = 20;
    for (let i = 0; i < channelList.length; i += chunkSize) {
      if (requestId !== loadRequestIdRef.current) return;

      const chunk = channelList.slice(i, i + chunkSize);
      const urls = chunk.map(c => c.url);

      try {
        const response = await fetch('/api/check-channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls })
        });

        if (requestId !== loadRequestIdRef.current) return;

        if (response.ok) {
          const results = await response.json();
          if (requestId !== loadRequestIdRef.current) return;
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
        if (requestId !== loadRequestIdRef.current) return;
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
    loadRequestIdRef.current += 1;
    const requestId = loadRequestIdRef.current;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(null);
    setCurrentPlaylistUrl(url);
    setChannelStatus({}); // Reset status
    try {
      let response;
      if (url.startsWith('blob:')) {
        response = await fetch(url, { signal: abortController.signal });
        if (!response.ok) throw new Error('Impossible de lire le fichier local');
      } else {
        // Use our internal proxy to avoid CORS issues for remote URLs
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        response = await fetch(proxyUrl, { signal: abortController.signal });
        
        if (!response.ok) {
          // Fallback to direct fetch if proxy fails for some reason
          response = await fetch(url, { signal: abortController.signal });
          if (!response.ok) throw new Error('Impossible de charger la playlist IPTV');
        }
      }

      const content = await response.text();
      const parsedChannels = parseM3U(content);
      
      if (parsedChannels.length === 0) {
        throw new Error('Aucune chaîne valide trouvée dans la playlist');
      }
      
      if (requestId !== loadRequestIdRef.current) return;

      setChannels(parsedChannels);
      setSelectedChannel(parsedChannels[0]);

      // Start health check in background
      checkChannelsHealth(parsedChannels, requestId);
    } catch (err: any) {
      if (err.name === 'AbortError' || requestId !== loadRequestIdRef.current) return;
      console.error(err);
      setError(
        err.message.includes('Failed to fetch') 
          ? 'Erreur CORS : La playlist est inaccessible car le domaine source bloque les requêtes externes. Essayez une URL avec CORS activé.'
          : err.message
      );
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [checkChannelsHealth]);

  const handlePlayerError = useCallback((playerError: string) => {
    console.log('Player error:', playerError);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/20">
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
        onOpenStats={() => setIsStatsOpen(true)}
      />
      
      <main className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        <Sidebar 
          channels={channels} 
          selectedChannel={isSplitView ? splitChannels[activeSplitIndex] : selectedChannel} 
          onChannelSelect={handleChannelSelect} 
          isLoading={isLoading}
          channelStatus={channelStatus}
          isMobileLandscape={isMobileLandscape}
          isOpen={isLandscapeSidebarOpen}
          onClose={() => setIsLandscapeSidebarOpen(false)}
        />

        <section className={`flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-background relative overflow-y-auto custom-scrollbar transition-colors duration-300 order-1 md:order-2 ${isMobileLandscape ? 'min-h-0' : 'min-h-[50vh]'}`}>
          {isMobileLandscape && (
             <button 
               onClick={() => setIsLandscapeSidebarOpen(true)}
               className="absolute top-4 left-4 z-40 p-2 bg-card/80 backdrop-blur-md rounded-xl border border-border shadow-lg md:hidden"
               aria-label="Ouvrir la liste des chaînes"
             >
               <Menu size={20} className="text-foreground" />
             </button>
          )}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          
          <GlobalPlayer 
            playlistName={playlistName}
            error={error}
            sleepTimerActive={sleepTimerActive}
            sleepTimerRemaining={sleepTimerRemaining}
            formatRemaining={formatRemaining}
            cancelSleepTimer={cancelSleepTimer}
            startSleepTimer={startSleepTimer}
            handlePlayerError={handlePlayerError}
          />
          <Routes>
            <Route path="/" element={<div />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>

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
          background: hsl(var(--border));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ffffff;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <StatsModal 
        isOpen={isStatsOpen} 
        onClose={() => setIsStatsOpen(false)} 
      />
    </div>
  );
}
