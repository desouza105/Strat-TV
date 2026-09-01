cat << 'INNER_EOF' > src/components/GlobalPlayer.tsx
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X, Timer, X as XIcon, Globe, MapPin, Grid2x2, WifiOff } from 'lucide-react';
import VideoPlayer, { VideoPlayerRef } from './VideoPlayer';
import { useGlobalPlayer } from '../context/GlobalPlayerContext';
import { useSettings } from '../context/SettingsContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { IPTVChannel } from '../types/iptv';

interface GlobalPlayerProps {
  playlistName: string;
  error: string | null;
  sleepTimerActive: boolean;
  sleepTimerRemaining: number;
  formatRemaining: (secs: number) => string;
  cancelSleepTimer: () => void;
  startSleepTimer: (m: number) => void;
  handlePlayerError: (e: string) => void;
}

export const GlobalPlayer = ({
  playlistName, error, sleepTimerActive, sleepTimerRemaining,
  formatRemaining, cancelSleepTimer, startSleepTimer, handlePlayerError
}: GlobalPlayerProps) => {
  const {
    selectedChannel, isMiniPlayer, setIsMiniPlayer,
    isSplitView, splitChannels, activeSplitIndex, setActiveSplitIndex,
    setSplitChannels, closePlayer
  } = useGlobalPlayer();
  
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const playerRef = useRef<VideoPlayerRef>(null);

  useEffect(() => {
    if ((selectedChannel || isSplitView) && settings.autoMiniPlayer) {
      if (location.pathname !== '/') {
        setIsMiniPlayer(true);
      } else {
        setIsMiniPlayer(false);
      }
    }
  }, [location.pathname, selectedChannel, isSplitView, settings.autoMiniPlayer, setIsMiniPlayer]);

  const expandSplitChannel = (channel: IPTVChannel) => {
    // Logic to expand split channel
  };

  const removeSplitChannel = (idx: number) => {
    setSplitChannels((prev: any) => {
      const next = [...prev];
      next.splice(idx, 1);
      if (next.length === 0) {
        closePlayer();
      }
      return next;
    });
  };

  if (!selectedChannel && !isSplitView) {
    if (location.pathname === '/') {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.6 }}
          className="text-center max-w-md z-10"
        >
          {error ? (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto border border-border">
                <WifiOff className="text-muted-foreground w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold uppercase text-foreground tracking-tight">Erreur de lecture</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-3xl md:text-5xl font-normal tracking-tighter text-foreground">
                  Moody<span className="font-serif italic text-muted-foreground/50">.</span>
                </h3>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-sm mx-auto font-light">
                  Choisissez un pays ou une catégorie dans le menu supérieur pour{' '}
                  <span className="font-serif italic text-foreground tracking-wide font-normal">accéder à vos chaînes préférées</span>.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      );
    }
    return null;
  }

  if (isMiniPlayer) {
    // Mini player only shows the primary channel
    const channel = isSplitView ? splitChannels[activeSplitIndex] : selectedChannel;
    if (!channel) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-20 right-4 md:bottom-4 md:right-4 w-[320px] rounded-xl overflow-hidden shadow-2xl z-50 bg-black border border-border"
        style={{ aspectRatio: '16/9' }}
      >
        <div className="absolute top-0 left-0 w-full h-full group">
          <VideoPlayer
            ref={playerRef}
            url={channel.url}
            name={channel.name}
            miniPlayer={true}
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col pointer-events-none">
             <div className="flex justify-between items-start p-2 pointer-events-auto">
               <span className="text-xs font-bold truncate px-2 py-1 bg-black/50 rounded">{channel.name}</span>
               <div className="flex gap-1">
                 <button onClick={(e) => { e.stopPropagation(); setIsMiniPlayer(false); navigate('/'); }} className="p-1.5 bg-black/50 hover:bg-white/20 rounded-lg transition-colors text-white">
                   <Maximize2 size={14} />
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); closePlayer(); }} className="p-1.5 bg-black/50 hover:bg-red-500/80 rounded-lg transition-colors text-white">
                   <X size={14} />
                 </button>
               </div>
             </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full player
  return (
    <AnimatePresence mode="wait">
      {isSplitView ? (
        <motion.div 
          key="split-view"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          className={`grid gap-6 w-full max-w-7xl z-10 ${
            splitChannels.length <= 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {(splitChannels.length <= 2 ? Array.from({ length: Math.max(1, splitChannels.length) }, (_, i) => i) : [0, 1, 2, 3]).map((idx) => {
            const channel = splitChannels[idx];
            return (
              <div 
                key={idx}
                onClick={() => setActiveSplitIndex(idx)}
                className={`relative flex flex-col rounded-2xl overflow-hidden border-2 transition-all group ${
                  activeSplitIndex === idx ? 'border-primary ring-4 ring-primary/10 shadow-2xl' : 'border-border'
                } ${!channel ? 'bg-card/50 border-dashed justify-center items-center cursor-pointer hover:bg-card' : 'bg-card'}`}
              >
                {channel ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-background/50 border-b border-border">
                      <div className="flex items-center gap-2 max-w-[60%]">
                        {channel.logo && (
                          <img src={channel.logo} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                        )}
                        <span className="text-xs font-bold truncate uppercase">{channel.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); expandSplitChannel(channel); }}
                          className="p-1.5 hover:bg-muted-foreground/10 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          title="Agrandir"
                        >
                          <Maximize2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeSplitChannel(idx); }}
                          className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
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
                        miniPlayer={false}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-3 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Grid2x2 className="w-10 h-10 mx-auto text-muted-foreground" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Zone Libre</p>
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
          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          className="w-full max-w-6xl z-10"
        >
          {/* Sleep Timer UI */}
          <AnimatePresence>
            {sleepTimerActive ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-6xl z-20 mb-3 flex items-center justify-between bg-background/80 backdrop-blur-sm border border-border rounded-2xl px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Timer size={16} className="text-foreground" />
                  <span className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Arrêt dans
                  </span>
                  <span className="text-lg font-black text-foreground tabular-nums">
                    {formatRemaining(sleepTimerRemaining)}
                  </span>
                </div>
                <button
                  onClick={cancelSleepTimer}
                  className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
                >
                  <XIcon size={14} /> Annuler
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <VideoPlayer 
            ref={playerRef}
            url={selectedChannel.url} 
            name={selectedChannel.name}
            onError={handlePlayerError}
            onStartSleepTimer={startSleepTimer}
            sleepTimerActive={sleepTimerActive}
            miniPlayer={false}
          />
          
          <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-2 tracking-tighter uppercase text-foreground">
                {selectedChannel.name}
              </h2>
              <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground uppercase tracking-widest"> 
                <span className="flex items-center gap-2 text-primary"><Globe size={14} /> DIRECT</span> 
                <span className="w-1.5 h-1.5 rounded-full bg-border" /> 
                <span className="flex items-center gap-2"><MapPin size={14} className="text-muted-foreground" /> {playlistName || 'INTERNATIONAL'}</span> 
                <span className="w-1.5 h-1.5 rounded-full bg-border" /> 
                <span className="text-muted-foreground">{selectedChannel.group || 'GÉNERAL'}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="bg-card hover:bg-muted px-6 py-2 rounded-xl text-sm font-bold text-foreground transition-all active:scale-95">
                REPORT
              </button>
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg">
                LIVE
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
INNER_EOF
