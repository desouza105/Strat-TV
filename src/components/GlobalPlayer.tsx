import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Maximize2, X, Timer, Tv, AlertTriangle, Compass, Plus, RefreshCw, LayoutGrid } from 'lucide-react';
import VideoPlayer, { VideoPlayerRef } from './VideoPlayer';
import { useGlobalPlayer } from '../context/GlobalPlayerContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  onExplore?: () => void;
  onImport?: () => void;
  onRetry?: () => void;
}

function Message({ icon, title, text, children }: { icon: React.ReactNode; title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="z-10 flex max-w-md flex-col items-center gap-4 self-center text-center animate-in fade-in duration-300">
      <div className="grid size-[72px] place-items-center rounded-[20px] border border-border bg-card text-muted-foreground">{icon}</div>
      <h2 className="mt-2 text-[28px] font-semibold leading-tight">{title}</h2>
      <p className="text-[15px] leading-relaxed text-muted-foreground">{text}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

export const GlobalPlayer = ({
  playlistName, error, sleepTimerActive, sleepTimerRemaining,
  formatRemaining, cancelSleepTimer, startSleepTimer, handlePlayerError,
  onExplore, onImport, onRetry,
}: GlobalPlayerProps) => {
  const {
    selectedChannel, setSelectedChannel, isMiniPlayer, setIsMiniPlayer,
    isSplitView, setIsSplitView, splitChannels, activeSplitIndex, setActiveSplitIndex,
    setSplitChannels, closePlayer,
  } = useGlobalPlayer();

  const playerRef = useRef<VideoPlayerRef>(null);

  const expandSplitChannel = (channel: IPTVChannel) => {
    setSelectedChannel(channel);
    setIsSplitView(false);
    setSplitChannels([]);
    setActiveSplitIndex(0);
  };

  const removeSplitChannel = (idx: number) => {
    setSplitChannels((prev) => {
      const next = [...prev];
      next.splice(idx, 1);
      if (next.length === 0) closePlayer();
      return next;
    });
  };

  if (!selectedChannel && !isSplitView) {
    if (error) {
      return (
        <Message icon={<AlertTriangle size={30} aria-hidden="true" />} title="Impossible de charger la playlist" text={error}>
          {onRetry && <Button onClick={onRetry}><RefreshCw /> Réessayer</Button>}
          {onExplore && <Button variant="outline" onClick={onExplore}>Changer de source</Button>}
        </Message>
      );
    }
    return (
      <Message
        icon={<Tv size={30} aria-hidden="true" />}
        title="Aucune chaîne sélectionnée"
        text="Choisis une chaîne dans la liste, ou explore les sources pour charger une playlist."
      >
        {onExplore && <Button onClick={onExplore}><Compass /> Explorer les sources</Button>}
        {onImport && <Button variant="outline" onClick={onImport}><Plus /> Importer</Button>}
      </Message>
    );
  }

  if (isMiniPlayer) {
    const channel = isSplitView ? splitChannels[activeSplitIndex] : selectedChannel;
    if (!channel) return null;

    return (
      <div className="fixed bottom-20 right-4 z-50 w-[320px] overflow-hidden rounded-[20px] border border-white/10 bg-black shadow-2xl animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-300 md:bottom-4" style={{ aspectRatio: '16/9' }}>
        <div className="group absolute inset-0">
          <VideoPlayer ref={playerRef} url={channel.url} name={channel.name} miniPlayer={true} />
          <div className="pointer-events-none absolute inset-0 flex flex-col bg-black/60 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <div className="pointer-events-auto flex items-start justify-between p-2">
              <Badge variant="overlay" className="max-w-[60%] truncate">{channel.name}</Badge>
              <div className="flex gap-1">
                <Button variant="secondary" size="icon-sm" aria-label="Agrandir le lecteur" onClick={(e) => { e.stopPropagation(); setIsMiniPlayer(false); }}>
                  <Maximize2 />
                </Button>
                <Button variant="secondary" size="icon-sm" aria-label="Fermer le mini-lecteur" onClick={(e) => { e.stopPropagation(); closePlayer(); }}>
                  <X />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSplitView) {
    const slots = [0, 1, 2, 3];
    return (
      <div className={cn('z-10 grid w-full gap-5 animate-in fade-in duration-300', 'grid-cols-1 md:grid-cols-2')}>
        {slots.map((idx) => {
          const channel = splitChannels[idx];
          const active = activeSplitIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => setActiveSplitIndex(idx)}
              className={cn(
                'relative flex flex-col overflow-hidden rounded-card transition-colors',
                channel ? 'bg-card' : 'cursor-pointer justify-center border-2 border-dashed border-white/15 hover:bg-card/50',
                channel && (active ? 'border-2 border-mint' : 'border border-white/[0.06]')
              )}
            >
              {channel ? (
                <>
                  <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <Badge variant="neutral" className="max-w-[10rem] truncate">{channel.name}</Badge>
                      {active && <Badge variant="solid">Actif</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); expandSplitChannel(channel); }}><Maximize2 /> Agrandir</Button>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); removeSplitChannel(idx); }}><X /> Retirer</Button>
                    </div>
                  </div>
                  <div className="min-h-0 flex-1">
                    <VideoPlayer url={channel.url} name={channel.name} onError={handlePlayerError} miniPlayer={false} />
                  </div>
                </>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-3 text-center">
                  <div className="grid size-12 place-items-center rounded-2xl border border-border bg-card text-muted-foreground"><Plus size={22} aria-hidden="true" /></div>
                  <p className="text-sm text-muted-foreground">Choisis une chaîne dans la liste pour remplir cet emplacement</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (!selectedChannel) return null;

  return (
    <div key={selectedChannel.url} className="z-10 w-full animate-in fade-in duration-300">
      {sleepTimerActive && (
        <div className="mb-3 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <Timer size={16} aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Arrêt dans</span>
            <span className="text-lg font-semibold tabular-nums">{formatRemaining(sleepTimerRemaining)}</span>
          </div>
          <Button variant="outline" size="sm" onClick={cancelSleepTimer}><X /> Annuler</Button>
        </div>
      )}

      <VideoPlayer
        ref={playerRef}
        url={selectedChannel.url}
        name={selectedChannel.name}
        onError={handlePlayerError}
        onStartSleepTimer={startSleepTimer}
        sleepTimerActive={sleepTimerActive}
        miniPlayer={false}
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-[28px] font-semibold leading-9">{selectedChannel.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="live"><span className="size-1.5 rounded-full bg-mint" /> DIRECT</Badge>
            <Badge variant="neutral">{selectedChannel.group || 'Général'}</Badge>
            <Badge variant="neutral">{playlistName || 'International'}</Badge>
          </div>
        </div>
        <Button variant="outline" onClick={() => { setSplitChannels((prev) => (prev.length ? prev : [selectedChannel])); setIsSplitView(true); }}><LayoutGrid /> Mosaïque</Button>
      </div>
    </div>
  );
};
