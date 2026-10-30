import React, { memo, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Maximize2, X, Timer, Tv, AlertTriangle, Compass, Plus, RefreshCw, LayoutGrid, ChevronUp, ChevronDown, Heart, Volume2, VolumeX, Play, Pause, PictureInPicture2, Cast, Maximize } from 'lucide-react';
import VideoPlayer, { VideoPlayerRef, PlayerSnapshot } from './VideoPlayer';
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
  channels?: IPTVChannel[];
  onZap?: (direction: 'next' | 'prev') => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
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

/** Carte volume : le curseur reste fluide, la mise à jour du lecteur est limitée à une fois par image. */
const VolumeCard = memo(function VolumeCard({ volume, muted, boostAvailable, onVolume, onToggleMute }: {
  volume: number; muted: boolean; boostAvailable: boolean; onVolume: (v: number) => void; onToggleMute: () => void;
}) {
  const [draft, setDraft] = useState(volume);
  const frame = useRef(0);
  const latest = useRef(volume);

  useEffect(() => { setDraft(volume); }, [volume]);
  useEffect(() => () => { if (frame.current) cancelAnimationFrame(frame.current); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setDraft(v);
    latest.current = v;
    if (!frame.current) {
      frame.current = requestAnimationFrame(() => { frame.current = 0; onVolume(latest.current); });
    }
  };

  return (
    <section aria-label="Volume" className="flex flex-col justify-between gap-3 rounded-card border border-white/[0.06] bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Volume</span>
        {draft > 1 && <Badge variant="live">Boost actif</Badge>}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="text-5xl font-light leading-none tabular-nums">{Math.round(draft * 100)} %</div>
        <Button variant="outline" size="icon" aria-label={muted ? 'Activer le son' : 'Couper le son'} onClick={onToggleMute}>
          {muted || draft === 0 ? <VolumeX /> : <Volume2 />}
        </Button>
      </div>
      <input
        type="range"
        aria-label="Volume"
        min={0}
        max={boostAvailable ? 2 : 1}
        step={0.05}
        value={draft}
        onChange={handleChange}
        className="w-full cursor-pointer accent-mint"
      />
    </section>
  );
});

export const GlobalPlayer = ({
  playlistName, error, sleepTimerActive, sleepTimerRemaining,
  formatRemaining, cancelSleepTimer, startSleepTimer, handlePlayerError,
  onExplore, onImport, onRetry, channels = [], onZap, isFavorite = false, onToggleFavorite,
}: GlobalPlayerProps) => {
  const {
    selectedChannel, setSelectedChannel, isMiniPlayer, setIsMiniPlayer,
    isSplitView, setIsSplitView, splitChannels, activeSplitIndex, setActiveSplitIndex,
    setSplitChannels, closePlayer,
  } = useGlobalPlayer();

  const playerRef = useRef<VideoPlayerRef>(null);
  const [snap, setSnap] = useState<PlayerSnapshot | null>(null);

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
      <div className="fixed bottom-20 right-3 z-50 w-[200px] overflow-hidden md:right-4 md:w-[320px] rounded-[20px] border border-white/10 bg-black shadow-2xl animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-300 md:bottom-4" style={{ aspectRatio: '16/9' }}>
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

  const currentIndex = channels.findIndex((c) => c.url === selectedChannel.url);
  const nextChannel = channels.length > 1 && currentIndex >= 0 ? channels[(currentIndex + 1) % channels.length] : null;

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
        externalControls
        fitViewport
        onStateChange={setSnap}
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
        <div className="flex gap-3">
          {onToggleFavorite && (
            <Button variant="outline" aria-pressed={isFavorite} onClick={onToggleFavorite}>
              <Heart fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'text-mint' : ''} /> {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
            </Button>
          )}
          <Button variant="outline" onClick={() => { setSplitChannels((prev) => (prev.length ? prev : [selectedChannel])); setIsSplitView(true); }}><LayoutGrid /> Mosaïque</Button>
        </div>
      </div>


      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <VolumeCard
          volume={snap?.volume ?? 1}
          muted={!!snap?.isMuted}
          boostAvailable={!!snap?.boostAvailable}
          onVolume={(v) => playerRef.current?.setVolume(v)}
          onToggleMute={() => playerRef.current?.toggleMute()}
        />

        <section aria-label="Qualité et pistes" className="flex flex-col gap-3 rounded-card border border-white/[0.06] bg-card p-5 md:col-span-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Qualité</span>
          {snap && snap.levels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={snap.currentLevel === -1 ? 'default' : 'outline'} onClick={() => playerRef.current?.setQuality(-1)}>Auto</Button>
              {snap.levels.map((l) => (
                <Button key={l.index} size="sm" variant={snap.currentLevel === l.index ? 'default' : 'outline'} onClick={() => playerRef.current?.setQuality(l.index)}>{l.height}p</Button>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground">Qualité automatique (ce flux ne propose pas de choix).</p>
          )}
          {snap && (snap.audioTracks.length > 1 || snap.subtitleTracks.length > 0) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {snap.audioTracks.length > 1 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Audio</span>
                  <div className="flex flex-wrap gap-2">
                    {snap.audioTracks.map((t) => (
                      <Button key={t.id} size="sm" variant={snap.activeAudio === t.id ? 'default' : 'outline'} onClick={() => playerRef.current?.setAudioTrack(t.id)}>{t.name || t.lang || `Piste ${t.id + 1}`}</Button>
                    ))}
                  </div>
                </div>
              )}
              {snap.subtitleTracks.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Sous-titres</span>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant={snap.activeSubtitle === -1 ? 'default' : 'outline'} onClick={() => playerRef.current?.setSubtitleTrack(-1)}>Aucun</Button>
                    {snap.subtitleTracks.map((t) => (
                      <Button key={t.id} size="sm" variant={snap.activeSubtitle === t.id ? 'default' : 'outline'} onClick={() => playerRef.current?.setSubtitleTrack(t.id)}>{t.name || t.lang || `Piste ${t.id + 1}`}</Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Cockpit : zapping, minuterie, raccourcis */}
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <section aria-label="Zapping" className="flex items-center gap-4 rounded-card border border-white/[0.06] bg-card p-5">
          <div className="flex flex-col gap-2">
            <Button variant="secondary" size="icon" aria-label="Chaîne précédente" disabled={!onZap || channels.length < 2} onClick={() => onZap?.('prev')}><ChevronUp /></Button>
            <Button variant="secondary" size="icon" aria-label="Chaîne suivante" disabled={!onZap || channels.length < 2} onClick={() => onZap?.('next')}><ChevronDown /></Button>
          </div>
          <div className="min-w-0">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Chaîne suivante</span>
            <div className="truncate text-lg font-semibold">{nextChannel ? nextChannel.name : '—'}</div>
            <div className="text-[13px] text-muted-foreground">{currentIndex >= 0 ? `Chaîne ${currentIndex + 1} sur ${channels.length}` : 'Zapping indisponible'}</div>
          </div>
        </section>

        <section aria-label="Minuterie" className="flex flex-col justify-between gap-3 rounded-card border border-white/[0.06] bg-card p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Minuterie</span>
          {sleepTimerActive ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-3xl font-light tabular-nums leading-none">{formatRemaining(sleepTimerRemaining)}</div>
                <div className="mt-1 text-[13px] text-muted-foreground">avant l'arrêt de la lecture</div>
              </div>
              <Button variant="outline" size="sm" onClick={cancelSleepTimer}><X /> Annuler</Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {[15, 30, 60, 90].map((m) => (
                <Button key={m} variant="outline" size="sm" onClick={() => startSleepTimer(m)}>{m} min</Button>
              ))}
            </div>
          )}
        </section>

        <section aria-label="Actions du lecteur" className="flex flex-col justify-between gap-3 rounded-card border border-white/[0.06] bg-card p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Lecteur</span>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => playerRef.current?.togglePlay()}>{snap?.isPlaying ? <Pause /> : <Play />} {snap?.isPlaying ? 'Pause' : 'Lecture'}</Button>
            <Button size="sm" variant="outline" disabled={!snap?.isPipAvailable} onClick={() => playerRef.current?.togglePip()}><PictureInPicture2 /> PiP</Button>
            <Button size="sm" variant="outline" disabled={!snap?.isCastAvailable} onClick={() => playerRef.current?.toggleCast()}><Cast /> {snap?.castState === 'connected' ? 'Diffusion active' : 'Diffuser'}</Button>
            <Button size="sm" variant="outline" onClick={() => playerRef.current?.toggleFullscreen()}><Maximize /> Plein écran</Button>
          </div>
        </section>

        <section aria-label="Raccourcis clavier" className="flex flex-col justify-between gap-3 rounded-card border border-white/[0.06] bg-card p-5 md:col-span-3">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Raccourcis</span>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] text-muted-foreground sm:grid-cols-3 lg:grid-cols-6">
            {[['Espace', 'Lecture'], ['M', 'Muet'], ['F', 'Plein écran'], ['← →', 'Zapper'], ['1–9', 'Volume'], ['Ctrl K', 'Recherche']].map(([k, l]) => (
              <li key={k} className="flex items-center gap-2"><Badge variant="neutral" className="text-foreground">{k}</Badge>{l}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
