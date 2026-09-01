import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { IPTVChannel } from '../types/iptv';

interface GlobalPlayerContextType {
  selectedChannel: IPTVChannel | null;
  setSelectedChannel: (channel: IPTVChannel | null) => void;
  isMiniPlayer: boolean;
  setIsMiniPlayer: (isMini: boolean) => void;
  isSplitView: boolean;
  setIsSplitView: (isSplit: boolean) => void;
  splitChannels: IPTVChannel[];
  setSplitChannels: (channels: IPTVChannel[] | ((prev: IPTVChannel[]) => IPTVChannel[])) => void;
  activeSplitIndex: number;
  setActiveSplitIndex: (index: number) => void;
  closePlayer: () => void;
}

const GlobalPlayerContext = createContext<GlobalPlayerContextType | undefined>(undefined);

export const GlobalPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [splitChannels, setSplitChannels] = useState<IPTVChannel[]>([]);
  const [activeSplitIndex, setActiveSplitIndex] = useState(0);

  const closePlayer = () => {
    setSelectedChannel(null);
    setIsMiniPlayer(false);
    setIsSplitView(false);
    setSplitChannels([]);
    setActiveSplitIndex(0);
  };

  return (
    <GlobalPlayerContext.Provider value={{
      selectedChannel, setSelectedChannel,
      isMiniPlayer, setIsMiniPlayer,
      isSplitView, setIsSplitView,
      splitChannels, setSplitChannels,
      activeSplitIndex, setActiveSplitIndex,
      closePlayer
    }}>
      {children}
    </GlobalPlayerContext.Provider>
  );
};

export const useGlobalPlayer = () => {
  const ctx = useContext(GlobalPlayerContext);
  if (!ctx) throw new Error('useGlobalPlayer must be used within GlobalPlayerProvider');
  return ctx;
};
