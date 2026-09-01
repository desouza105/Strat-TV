import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type VideoQuality = 'Auto' | '1080p' | '720p' | '480p';
export type BufferSize = 'Auto' | 'Faible' | 'Élevé';
export type Theme = 'system' | 'light' | 'dark';
export type Density = 'Confortable' | 'Compact';
export type SidebarMode = 'always_open' | 'auto';

export interface AppSettings {
  // Lecture
  videoQuality: VideoQuality;
  autoplay: boolean;
  backgroundPlayback: boolean;
  startWithSound: boolean;
  subtitlesEnabled: boolean;
  preferredAudio: string;
  
  // Player
  showControls: boolean;
  autoMiniPlayer: boolean;
  pipEnabled: boolean;
  fastZapping: boolean;
  rememberVolume: boolean;
  lastVolume: number;
  
  // Performance
  autoQuality: boolean;
  dataSaver: boolean;
  preload: boolean;
  bufferSize: BufferSize;
  
  // Apparence
  theme: Theme;
  animationsEnabled: boolean;
  compactMode: boolean;
  density: Density;
  
  // Navigation
  sidebarMode: SidebarMode;
  keyboardShortcuts: boolean;
  searchShortcut: boolean;
  
  // Diffusion
  chromecastAuto: boolean;
  airplayAuto: boolean;
  rememberDevice: boolean;
}

const defaultSettings: AppSettings = {
  videoQuality: 'Auto',
  autoplay: true,
  backgroundPlayback: true,
  startWithSound: false,
  subtitlesEnabled: true,
  preferredAudio: 'Auto',
  
  showControls: true,
  autoMiniPlayer: true,
  pipEnabled: true,
  fastZapping: true,
  rememberVolume: true,
  lastVolume: 1,
  
  autoQuality: true,
  dataSaver: false,
  preload: true,
  bufferSize: 'Auto',
  
  theme: 'system',
  animationsEnabled: true,
  compactMode: false,
  density: 'Confortable',
  
  sidebarMode: 'auto',
  keyboardShortcuts: true,
  searchShortcut: true,
  
  chromecastAuto: true,
  airplayAuto: true,
  rememberDevice: true,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('strat-tv-settings');
      if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Error loading settings', e);
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('strat-tv-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => setSettings(defaultSettings);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
