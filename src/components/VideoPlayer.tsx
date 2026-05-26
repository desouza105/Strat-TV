/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, AlertCircle, PictureInPicture2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoPlayerProps {
  url: string;
  name: string;
  onError?: (error: string) => void;
}

export interface VideoPlayerRef {
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  setVolume: (value: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({ url, name, onError }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPipAvailable, setIsPipAvailable] = useState(false);
  const [levels, setLevels] = useState<{ index: number; height: number; bitrate: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 for Auto
  const [isQualityOpen, setIsQualityOpen] = useState(false);

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
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setIsLoading(true);
    setError(null);

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        const availableLevels = hls.levels.map((level, index) => ({
          index,
          height: level.height,
          bitrate: level.bitrate
        })).sort((a, b) => b.height - a.height); // Sort descending quality
        
        setLevels(availableLevels);
        setCurrentLevel(hls.currentLevel);

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

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Network error encountered.");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Media error encountered.");
              hls.recoverMediaError();
              break;
            default:
              setError("Stream unavailable.");
              hls.destroy();
              break;
          }
          if (onError) onError(error || "Stream error");
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari native HLS support
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(() => setIsPlaying(false));
      });
      video.addEventListener('error', () => {
        setError("Native video error.");
        if (onError) onError("Native video error");
      });
    } else {
      setError("HLS is not supported in this browser.");
      if (onError) onError("HLS not supported");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
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
    if (videoRef.current) {
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

  const changeQuality = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setCurrentLevel(index);
      setIsQualityOpen(false);
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black group overflow-hidden rounded-xl shadow-2xl">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
          <Loader2 className="w-12 h-12 text-brand-secondary animate-spin" />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-app-card z-20 p-6 text-center">
          <AlertCircle className="w-16 h-16 text-brand-secondary mb-4" />
          <h3 className="text-xl font-bold text-app-text mb-2">Flux indisponible</h3>
          <p className="text-app-text-muted max-w-md">{error}</p>
        </div>
      )}

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay}
                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                {isPlaying ? <Pause className="fill-current w-6 h-6" /> : <Play className="fill-current w-6 h-6" />}
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <button 
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
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
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 rounded-lg transition-colors text-white text-[10px] font-black uppercase tracking-widest border border-white/20"
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
                        className="absolute bottom-full right-0 mb-2 w-32 bg-app-card border border-app-border rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-1 uppercase text-[10px] font-black text-app-text-muted border-b border-app-border text-center bg-app-bg/50">
                          Qualité
                        </div>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                          <button
                            onClick={() => changeQuality(-1)}
                            className={`w-full px-4 py-2 text-left text-[11px] font-bold transition-colors ${currentLevel === -1 ? 'bg-brand-primary text-white' : 'text-app-text hover:bg-zinc-800'}`}
                          >
                            AUTO
                          </button>
                          {levels.map((level) => (
                            <button
                              key={level.index}
                              onClick={() => changeQuality(level.index)}
                              className={`w-full px-4 py-2 text-left text-[11px] font-bold transition-colors ${currentLevel === level.index ? 'bg-brand-primary text-white' : 'text-app-text hover:bg-zinc-800'}`}
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
                  className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                  title="Miniature (PiP)"
                >
                  <PictureInPicture2 className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
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
