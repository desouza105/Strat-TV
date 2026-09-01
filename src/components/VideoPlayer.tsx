/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, AlertCircle, PictureInPicture2, Settings, Timer, Captions, CaptionsOff, Check, Cast } from 'lucide-react';
import { useSettings } from "../context/SettingsContext";
import { motion, AnimatePresence } from 'motion/react';

interface AudioTrack {
  id: number;
  name: string;
  lang: string;
  default?: boolean;
}
interface SubtitleTrack {
  id: number;
  name: string;
  lang: string;
  default?: boolean;
}

interface VideoPlayerProps {
  url: string;
  name: string;
  onError?: (error: string) => void;
  onStartSleepTimer?: (minutes: number) => void;
  sleepTimerActive?: boolean;
  miniPlayer?: boolean;
}

export interface VideoPlayerRef {
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  setVolume: (value: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({ url, name, onError, onStartSleepTimer, sleepTimerActive, miniPlayer = false }, ref) => {
  const { settings, updateSetting } = useSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(!settings.startWithSound);
  const [volume, setVolume] = useState(settings.rememberVolume ? settings.lastVolume : 1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPipAvailable, setIsPipAvailable] = useState(false);
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [castState, setCastState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [levels, setLevels] = useState<{ index: number; height: number; bitrate: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 for Auto
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [activeAudio, setActiveAudio] = useState<number>(-1);
  const [activeSubtitle, setActiveSubtitle] = useState<number>(-1);
  const [showTracksMenu, setShowTracksMenu] = useState(false);

  const hasBufferedFragmentRef = useRef(false);
  const usedProxyFallbackRef = useRef(false);
  const retryCountRef = useRef(0);
  const pendingRetryTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);
  const stallTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);
  const lastCurrentTimeRef = useRef<number>(0);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const [needsUnmutePrompt, setNeedsUnmutePrompt] = useState(false);

  const safePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (playPromiseRef.current) {
      await playPromiseRef.current.catch(() => {});
    }

    try {
      playPromiseRef.current = video.play();
      await playPromiseRef.current;
      setIsPlaying(true);
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        video.muted = true;
        setIsMuted(true);
        setNeedsUnmutePrompt(true);
        try {
          playPromiseRef.current = video.play();
          await playPromiseRef.current;
          setIsPlaying(true);
        } catch (e) {
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    togglePlay,
    toggleMute,
    toggleFullscreen,
    setVolume: (value: number) => {
      if (videoRef.current) {
        videoRef.current.volume = value;
        setVolume(value);
        setIsMuted(value === 0);
        if (value > 0) {
          setNeedsUnmutePrompt(false);
        }
      }
    }
  }));

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    setIsPipAvailable(
      typeof document !== 'undefined' && 
      document.pictureInPictureEnabled && 
      !videoRef.current?.disablePictureInPicture
    );

    const video = videoRef.current;
    if (!video) return;

    if ('WebKitPlaybackTargetAvailabilityEvent' in window) {
      const handleAirPlayAvailability = (e: any) => {
        setIsCastAvailable(e.availability === 'available');
      };
      video.addEventListener('webkitplaybacktargetavailabilitydidchange', handleAirPlayAvailability);
      return () => video.removeEventListener('webkitplaybacktargetavailabilitydidchange', handleAirPlayAvailability);
    } else if ((video as any).remote) {
      const remote = (video as any).remote;
      remote.watchAvailability((available: boolean) => {
        setIsCastAvailable(available);
      }).catch(() => {
        setIsCastAvailable(true); // Fallback
      });

      const updateState = (e: any) => {
        setCastState(e.target.state);
      };
      remote.addEventListener('connect', updateState);
      remote.addEventListener('connecting', updateState);
      remote.addEventListener('disconnect', updateState);
      return () => {
        remote.removeEventListener('connect', updateState);
        remote.removeEventListener('connecting', updateState);
        remote.removeEventListener('disconnect', updateState);
      };
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setIsLoading(true);
    setError(null);
    setAudioTracks([]);
    setSubtitleTracks([]);
    setActiveAudio(-1);
    setActiveSubtitle(-1);
    setShowTracksMenu(false);
    
    hasBufferedFragmentRef.current = false;
    usedProxyFallbackRef.current = false;
    retryCountRef.current = 0;
    lastCurrentTimeRef.current = 0;
    if (pendingRetryTimeoutRef.current) {
      clearTimeout(pendingRetryTimeoutRef.current as number);
      pendingRetryTimeoutRef.current = null;
    }
    if (stallTimeoutRef.current) {
      clearTimeout(stallTimeoutRef.current as number);
      stallTimeoutRef.current = null;
    }

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    const handleLoadedMetadata = () => {
      setIsLoading(false);
      if (settings.autoplay) safePlay();
    };

    const handleVideoError = () => {
      setError("Native video error.");
      if (onError) onError("Native video error");
    };

    const initHlsInstance = (sourceUrl: string) => {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsLoading(false);
        const availableLevels = hls.levels.map((level, index) => ({
          index,
          height: level.height,
          bitrate: level.bitrate
        })).sort((a, b) => b.height - a.height); // Sort descending quality
        
        setLevels(availableLevels);
        setCurrentLevel(hls.currentLevel);

        // Pistes audio
        if (hls.audioTracks && hls.audioTracks.length > 1) {
          const tracks: AudioTrack[] = hls.audioTracks.map((t, i) => ({
            id: i,
            name: t.name || `Audio ${i + 1}`,
            lang: t.lang || '',
            default: t.default,
          }));
          setAudioTracks(tracks);
          setActiveAudio(hls.audioTrack);
        } else {
          setAudioTracks([]);
        }
        
        // Sous-titres
        if (hls.subtitleTracks && hls.subtitleTracks.length > 0) {
          const subs: SubtitleTrack[] = hls.subtitleTracks.map((t, i) => ({
            id: i,
            name: t.name || `Subtitle ${i + 1}`,
            lang: t.lang || '',
            default: t.default,
          }));
          setSubtitleTracks(subs);
          setActiveSubtitle(hls.subtitleTrack ?? -1);
        } else {
          setSubtitleTracks([]);
        }

        if (settings.autoplay) safePlay();
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        if (hls.autoLevelEnabled) {
          setCurrentLevel(-1);
        } else {
          setCurrentLevel(data.level);
        }
      });

      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        hasBufferedFragmentRef.current = true;
      });

      const MAX_RETRIES = 2;

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal && (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR || (data.details as string) === 'bufferStalledError')) {
          if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            if (currentTime === lastCurrentTimeRef.current) {
              videoRef.current.currentTime += 0.1;
            }
            lastCurrentTimeRef.current = currentTime;
          }
        }

        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !hasBufferedFragmentRef.current && !usedProxyFallbackRef.current) {
            usedProxyFallbackRef.current = true;
            retryCountRef.current += 1;
            hls.destroy();
            initHlsInstance(`/api/stream-proxy?url=${encodeURIComponent(url)}`);
            return;
          }

          let errorMessage = "Stream error";
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (retryCountRef.current < MAX_RETRIES) {
                retryCountRef.current += 1;
                pendingRetryTimeoutRef.current = setTimeout(() => {
                  hls.startLoad();
                }, 1500 * retryCountRef.current);
                return; // Do not call onError or setError yet
              } else {
                errorMessage = "Flux indisponible après plusieurs tentatives.";
                setError(errorMessage);
                if (onError) onError(errorMessage);
                return;
              }
            case Hls.ErrorTypes.MEDIA_ERROR:
              if (retryCountRef.current < MAX_RETRIES) {
                retryCountRef.current += 1;
                pendingRetryTimeoutRef.current = setTimeout(() => {
                  hls.recoverMediaError();
                }, 1500 * retryCountRef.current);
                return; // Do not call onError or setError yet
              } else {
                errorMessage = "Flux indisponible après plusieurs tentatives.";
                setError(errorMessage);
                if (onError) onError(errorMessage);
                return;
              }
            default:
              errorMessage = "Stream unavailable.";
              setError(errorMessage);
              hls.destroy();
              break;
          }
          if (onError) onError(errorMessage);
        }
      });
    };

    if (Hls.isSupported()) {
      initHlsInstance(url);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari native HLS support
      video.src = url;
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('error', handleVideoError);
    } else {
      setError("HLS is not supported in this browser.");
      if (onError) onError("HLS not supported");
    }

    return () => {
      if (pendingRetryTimeoutRef.current) {
        clearTimeout(pendingRetryTimeoutRef.current as number);
      }
      if (stallTimeoutRef.current) {
        clearTimeout(stallTimeoutRef.current as number);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleVideoError);
    };
  }, [url, onError]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        if (settings.autoplay) safePlay();
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted) {
        setNeedsUnmutePrompt(false);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (settings.rememberVolume) updateSetting("lastVolume", value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      const newMuted = value === 0;
      setIsMuted(newMuted);
      if (!newMuted) {
        setNeedsUnmutePrompt(false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    } else if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("Failed to enter Picture-in-Picture mode:", err);
    }
  };

  const toggleCast = async () => {
    if (!videoRef.current) return;
    
    if ('webkitShowPlaybackTargetPicker' in videoRef.current) {
      (videoRef.current as any).webkitShowPlaybackTargetPicker();
    } else if ((videoRef.current as any).remote) {
      try {
        await (videoRef.current as any).remote.prompt();
      } catch (err) {
        console.error("Failed to prompt remote playback:", err);
      }
    }
  };

  const changeQuality = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setCurrentLevel(index);
      setIsQualityOpen(false);
    }
  };

  const handleAudioChange = (id: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.audioTrack = id;
    setActiveAudio(id);
  };

  const handleSubtitleChange = (id: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.subtitleTrack = id;
    setActiveSubtitle(id);
  };

  return (
    <div className="relative w-full aspect-video bg-black group overflow-hidden rounded-xl shadow-2xl">
      {castState === "connected" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-6 text-center">
          <Cast className="w-16 h-16 text-primary mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-foreground mb-2">Diffusion active</h3>
          <p className="text-muted-foreground max-w-md">La vidéo est en cours de lecture sur un autre écran.</p>
        </div>
      )}
      <video
        ref={videoRef}
        muted={isMuted}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => {
          if (hasBufferedFragmentRef.current && !stallTimeoutRef.current && hlsRef.current) {
            stallTimeoutRef.current = setTimeout(() => {
              if (hlsRef.current) {
                hlsRef.current.startLoad();
              }
              stallTimeoutRef.current = null;
            }, 8000);
          }
        }}
        onPlaying={() => {
          if (stallTimeoutRef.current) {
            clearTimeout(stallTimeoutRef.current as number);
            stallTimeoutRef.current = null;
          }
        }}
        onTimeUpdate={() => {
          if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            if (currentTime > lastCurrentTimeRef.current) {
              if (stallTimeoutRef.current) {
                clearTimeout(stallTimeoutRef.current as number);
                stallTimeoutRef.current = null;
              }
            }
            lastCurrentTimeRef.current = currentTime;
          }
        }}
        playsInline
        {...{ 'x-webkit-airplay': 'allow' }}
      />

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {/* Unmute Overlay */}
      {needsUnmutePrompt && !error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.muted = false;
                setIsMuted(false);
                setVolume(1);
                setNeedsUnmutePrompt(false);
              }
            }}
            className="flex items-center gap-2 bg-black/80 hover:bg-black text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-xl transition-all"
          >
            <VolumeX className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Activer le son</span>
          </button>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm z-20 p-6 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Flux indisponible</h3>
          <p className="text-muted-foreground max-w-md">{error}</p>
        </div>
      )}

      {/* Custom Controls */}
      {!miniPlayer && settings.showControls && (
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay}
                className="p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors text-foreground"
                aria-label={isPlaying ? "Mettre en pause" : "Lire"}
              >
                {isPlaying ? <Pause className="fill-current w-6 h-6" /> : <Play className="fill-current w-6 h-6" />}
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <button 
                  onClick={toggleMute}
                  className="p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors text-foreground"
                  aria-label={isMuted || volume === 0 ? "Activer le son" : "Couper le son"}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="text-foreground text-sm font-medium ml-2 drop-shadow-md">
                {name}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quality Settings */}
              {levels.length > 0 && (
                <div className="relative">
                  <button 
                    onClick={() => setIsQualityOpen(!isQualityOpen)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-lg transition-colors text-foreground text-[10px] font-semibold uppercase tracking-widest border border-white/20"
                    aria-label="Paramètres de qualité"
                  >
                    <Settings className={`w-3.5 h-3.5 ${isQualityOpen ? 'animate-spin-slow' : ''}`} />
                    {currentLevel === -1 ? 'AUTO' : `${levels.find(l => l.index === currentLevel)?.height || ''}P`}
                  </button>

                  <AnimatePresence>
                    {isQualityOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="absolute bottom-full right-0 mb-2 w-32 bg-background border border-border rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-1.5 uppercase text-[10px] font-semibold text-muted-foreground border-b border-border text-center bg-muted/50">
                          Qualité
                        </div>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                          <button
                            onClick={() => changeQuality(-1)}
                            className={`w-full px-4 py-2 text-left text-xs font-semibold transition-colors ${currentLevel === -1 ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}
                          >
                            AUTO
                          </button>
                          {levels.map((level) => (
                            <button
                              key={level.index}
                              onClick={() => changeQuality(level.index)}
                              className={`w-full px-4 py-2 text-left text-xs font-semibold transition-colors ${currentLevel === level.index ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}
                            >
                              {level.height}P
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {isPipAvailable && settings.pipEnabled && (
                <button 
                  onClick={togglePip}
                  className="p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors text-foreground"
                  title="Miniature (PiP)"
                  aria-label="Afficher en mode miniature (PiP)"
                >
                  <PictureInPicture2 className="w-5 h-5" />
                </button>
              )}

              {isCastAvailable && (
                <button 
                  onClick={toggleCast}
                  className={`p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors ${castState === 'connected' ? 'text-primary' : 'text-foreground'}`}
                  title="Diffuser"
                  aria-label="Diffuser sur un autre appareil"
                >
                  <Cast className={`w-5 h-5 ${castState === 'connected' ? 'fill-current' : ''}`} />
                </button>
              )}

              {(audioTracks.length > 1 || subtitleTracks.length > 0) && (
                <div className="relative">
                  <button
                    onClick={() => setShowTracksMenu(!showTracksMenu)}
                    className={`p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg transition-all hover:bg-muted ${showTracksMenu ? 'text-foreground bg-muted' : 'text-muted-foreground'}`}
                    title="Pistes audio / Sous-titres"
                    aria-label="Pistes audio et sous-titres"
                  >
                    <Captions size={18} />
                  </button>
                  
                  <AnimatePresence>
                    {showTracksMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowTracksMenu(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 5 }}
                          className="absolute bottom-full right-0 mb-2 bg-background border border-border rounded-xl p-3 z-20 min-w-[200px] shadow-2xl"
                        >
                          {/* Pistes audio */}
                          {audioTracks.length > 1 && (
                            <div className="mb-3">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                                Piste audio
                              </p>
                              {audioTracks.map(track => (
                                <button
                                  key={track.id}
                                  onClick={() => handleAudioChange(track.id)}
                                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeAudio === track.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                >
                                  <span className="flex items-center gap-2">
                                    <Volume2 size={14} />
                                    {track.name}
                                  </span>
                                  {track.lang && (
                                    <span className="text-[10px] text-muted-foreground uppercase">
                                      {track.lang}
                                    </span>
                                  )}
                                  {activeAudio === track.id && (
                                    <Check size={14} className="text-primary ml-1" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Séparateur */}
                          {audioTracks.length > 1 && subtitleTracks.length > 0 && (
                            <div className="h-[1px] bg-border my-2 mx-1" />
                          )}
                          
                          {/* Sous-titres */}
                          {subtitleTracks.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                                Sous-titres
                              </p>
                              
                              <button
                                onClick={() => handleSubtitleChange(-1)}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeSubtitle === -1 ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                              >
                                <span className="flex items-center gap-2">
                                  <CaptionsOff size={14} />
                                  Désactivé
                                </span>
                                {activeSubtitle === -1 && (
                                  <Check size={14} className="text-primary" />
                                )}
                              </button>
                              
                              {subtitleTracks.map(track => (
                                <button
                                  key={track.id}
                                  onClick={() => handleSubtitleChange(track.id)}
                                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeSubtitle === track.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                >
                                  <span className="flex items-center gap-2">
                                    <Captions size={14} />
                                    {track.name}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    {track.lang && (
                                      <span className="text-[10px] text-muted-foreground uppercase">
                                        {track.lang}
                                      </span>
                                    )}
                                    {activeSubtitle === track.id && (
                                      <Check size={14} className="text-primary" />
                                    )}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowSleepMenu(!showSleepMenu)}
                  className={`p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg transition-all hover:bg-white/10 ${sleepTimerActive ? 'text-primary' : 'text-muted-foreground'}`}
                  title="Sleep Timer"
                  aria-label="Minuteur de mise en veille"
                >
                  <Timer size={18} />
                </button>
                
                <AnimatePresence>
                  {showSleepMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSleepMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                        className="absolute bottom-full right-0 mb-2 bg-background border border-border rounded-xl p-3 z-20 min-w-[160px] shadow-2xl"
                      >
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                          Arrêter dans
                        </p>
                        {[15, 30, 60, 90].map(min => (
                          <button
                            key={min}
                            onClick={() => {
                              onStartSleepTimer?.(min);
                              setShowSleepMenu(false);
                            }}
                            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                          >
                            <span>{min} min</span>
                            <span className="text-[10px] text-muted-foreground">
                              {min >= 60 ? `${min/60}h` : ''}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={toggleFullscreen}
                className="p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors text-foreground"
                aria-label="Basculer le plein écran"
              >
                <Maximize className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
});

export default VideoPlayer;
