/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, AlertCircle, PictureInPicture2, Settings, Timer, Captions, CaptionsOff, Check, Cast } from 'lucide-react';
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
}

export interface VideoPlayerRef {
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  setVolume: (value: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({ url, name, onError, onStartSleepTimer, sleepTimerActive }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
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

  useImperativeHandle(ref, () => ({
    togglePlay,
    toggleMute,
    toggleFullscreen,
    setVolume: (value: number) => {
      if (videoRef.current) {
        videoRef.current.volume = value;
        setVolume(value);
        setIsMuted(value === 0);
      }
    }
  }));

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

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    const handleLoadedMetadata = () => {
      setIsLoading(false);
      video.play().catch(() => setIsPlaying(false));
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

        video.play().catch(() => {
          setIsPlaying(false);
        });
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

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !hasBufferedFragmentRef.current && !usedProxyFallbackRef.current) {
            usedProxyFallbackRef.current = true;
            hls.destroy();
            initHlsInstance(`/api/stream-proxy?url=${encodeURIComponent(url)}`);
            return;
          }

          let errorMessage = "Stream error";
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              errorMessage = "Network error encountered.";
              setError(errorMessage);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              errorMessage = "Media error encountered.";
              setError(errorMessage);
              hls.recoverMediaError();
              break;
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
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      setIsMuted(value === 0);
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
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        playsInline
        {...{ 'x-webkit-airplay': 'allow' }}
      />

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
          <Loader2 className="w-12 h-12 text-brand-secondary animate-spin" />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-20 p-6 text-center">
          <AlertCircle className="w-16 h-16 text-brand-secondary mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Flux indisponible</h3>
          <p className="text-muted-foreground max-w-md">{error}</p>
        </div>
      )}

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay}
                className="p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors text-white"
                aria-label={isPlaying ? "Mettre en pause" : "Lire"}
              >
                {isPlaying ? <Pause className="fill-current w-6 h-6" /> : <Play className="fill-current w-6 h-6" />}
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <button 
                  onClick={toggleMute}
                  className="p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors text-white"
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
                  className="w-24 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-brand-secondary"
                />
              </div>

              <div className="text-white text-sm font-medium ml-2 drop-shadow-md">
                {name}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quality Settings */}
              {levels.length > 0 && (
                <div className="relative">
                  <button 
                    onClick={() => setIsQualityOpen(!isQualityOpen)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-lg transition-colors text-white text-[0.625rem] font-black uppercase tracking-widest border border-white/20"
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
                        className="absolute bottom-full right-0 mb-2 w-32 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-1 uppercase text-[0.625rem] font-black text-muted-foreground border-b border-border text-center bg-background/50">
                          Qualité
                        </div>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                          <button
                            onClick={() => changeQuality(-1)}
                            className={`w-full px-4 py-2 text-left text-[0.6875rem] font-bold transition-colors ${currentLevel === -1 ? 'bg-brand-primary text-white' : 'text-foreground hover:bg-zinc-800'}`}
                          >
                            AUTO
                          </button>
                          {levels.map((level) => (
                            <button
                              key={level.index}
                              onClick={() => changeQuality(level.index)}
                              className={`w-full px-4 py-2 text-left text-[0.6875rem] font-bold transition-colors ${currentLevel === level.index ? 'bg-brand-primary text-white' : 'text-foreground hover:bg-zinc-800'}`}
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

              {isPipAvailable && (
                <button 
                  onClick={togglePip}
                  className="p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors text-white"
                  title="Miniature (PiP)"
                  aria-label="Afficher en mode miniature (PiP)"
                >
                  <PictureInPicture2 className="w-5 h-5" />
                </button>
              )}

              {isCastAvailable && (
                <button 
                  onClick={toggleCast}
                  className={`p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors ${castState === 'connected' ? 'text-brand-primary' : 'text-white'}`}
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
                    className={`p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg transition-all hover:bg-white/10 ${showTracksMenu ? 'text-white bg-white/10' : 'text-zinc-400'}`}
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
                          className="absolute bottom-full right-0 mb-2 bg-zinc-900 border border-zinc-700 rounded-2xl p-3 z-20 min-w-[200px] shadow-2xl"
                        >
                          {/* Pistes audio */}
                          {audioTracks.length > 1 && (
                            <div className="mb-3">
                              <p className="text-[0.5625rem] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">
                                Piste audio
                              </p>
                              {audioTracks.map(track => (
                                <button
                                  key={track.id}
                                  onClick={() => handleAudioChange(track.id)}
                                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeAudio === track.id ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                  <span className="flex items-center gap-2">
                                    <Volume2 size={14} />
                                    {track.name}
                                  </span>
                                  {track.lang && (
                                    <span className="text-[0.625rem] text-zinc-600 uppercase">
                                      {track.lang}
                                    </span>
                                  )}
                                  {activeAudio === track.id && (
                                    <Check size={14} className="text-white ml-1" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Séparateur */}
                          {audioTracks.length > 1 && subtitleTracks.length > 0 && (
                            <div className="h-[0.5px] bg-zinc-700 my-2 mx-1" />
                          )}
                          
                          {/* Sous-titres */}
                          {subtitleTracks.length > 0 && (
                            <div>
                              <p className="text-[0.5625rem] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">
                                Sous-titres
                              </p>
                              
                              <button
                                onClick={() => handleSubtitleChange(-1)}
                                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeSubtitle === -1 ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                              >
                                <span className="flex items-center gap-2">
                                  <CaptionsOff size={14} />
                                  Désactivé
                                </span>
                                {activeSubtitle === -1 && (
                                  <Check size={14} className="text-white" />
                                )}
                              </button>
                              
                              {subtitleTracks.map(track => (
                                <button
                                  key={track.id}
                                  onClick={() => handleSubtitleChange(track.id)}
                                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeSubtitle === track.id ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                  <span className="flex items-center gap-2">
                                    <Captions size={14} />
                                    {track.name}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    {track.lang && (
                                      <span className="text-[0.625rem] text-zinc-600 uppercase">
                                        {track.lang}
                                      </span>
                                    )}
                                    {activeSubtitle === track.id && (
                                      <Check size={14} className="text-white" />
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
                  className={`p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg transition-all hover:bg-white/10 ${sleepTimerActive ? 'text-white' : 'text-zinc-400'}`}
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
                        className="absolute bottom-full right-0 mb-2 bg-zinc-900 border border-zinc-700 rounded-2xl p-3 z-20 min-w-[160px] shadow-2xl"
                      >
                        <p className="text-[0.5625rem] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">
                          Arrêter dans
                        </p>
                        {[15, 30, 60, 90].map(min => (
                          <button
                            key={min}
                            onClick={() => {
                              onStartSleepTimer?.(min);
                              setShowSleepMenu(false);
                            }}
                            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <span>{min} min</span>
                            <span className="text-[0.625rem] text-zinc-600">
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
                className="p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors text-white"
                aria-label="Basculer le plein écran"
              >
                <Maximize className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;
