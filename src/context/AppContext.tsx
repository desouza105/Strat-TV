import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { HistoryItem, WatchlistItem, MediaItem } from '../types/media';

interface AppContextType {
  watchlist: WatchlistItem[];
  history: HistoryItem[];
  addToWatchlist: (item: MediaItem) => void;
  removeFromWatchlist: (id: number) => void;
  addToHistory: (item: MediaItem & { season?: number; episode?: number }) => void;
  updateProgress: (id: number, progress: number, timestamp: number) => void;
  clearHistory: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem('moody_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('moody_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('moody_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('moody_history', JSON.stringify(history));
  }, [history]);

  const addToWatchlist = useCallback((item: MediaItem) => {
    setWatchlist(prev => {
      if (prev.some(w => w.id === item.id)) return prev;
      return [{ ...item, addedAt: new Date().toISOString() }, ...prev];
    });
  }, []);

  const removeFromWatchlist = useCallback((id: number) => {
    setWatchlist(prev => prev.filter(w => w.id !== id));
  }, []);

  const addToHistory = useCallback((item: MediaItem & { season?: number; episode?: number }) => {
    setHistory(prev => {
      const existing = prev.find(h => h.id === item.id);
      if (existing) {
        // Already in history — update watchedAt and season/episode 
        // but NEVER reset progress or timestamp
        return [
          { 
            ...existing, 
            watchedAt: new Date().toISOString(),
            season: (item as any).season ?? existing.season,
            episode: (item as any).episode ?? existing.episode,
          },
          ...prev.filter(h => h.id !== item.id)
        ];
      }
      // New item — add with zero progress
      return [
        { 
          ...item, 
          watchedAt: new Date().toISOString(), 
          progress: 0, 
          timestamp: 0 
        },
        ...prev
      ];
    });
  }, []);

  const updateProgress = useCallback((id: number, progress: number, timestamp: number) => {
    setHistory(prev => prev.map(h => 
      h.id === id ? { ...h, progress, timestamp, watchedAt: new Date().toISOString() } : h
    ));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('moody_history');
  }, []);

  return (
    <AppContext.Provider value={{ watchlist, history, addToWatchlist, removeFromWatchlist, addToHistory, updateProgress, clearHistory }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
