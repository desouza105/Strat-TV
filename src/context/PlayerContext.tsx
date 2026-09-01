import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IPTVChannel } from '../types/iptv';

interface PlayerContextType {
  channel: IPTVChannel | null;
  setChannel: (channel: IPTVChannel | null) => void;
  isMiniPlayer: boolean;
  setIsMiniPlayer: (isMini: boolean) => void;
  closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [channel, setChannel] = useState<IPTVChannel | null>(null);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);

  const closePlayer = () => {
    setChannel(null);
    setIsMiniPlayer(false);
  };

  return (
    <PlayerContext.Provider value={{ channel, setChannel, isMiniPlayer, setIsMiniPlayer, closePlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
