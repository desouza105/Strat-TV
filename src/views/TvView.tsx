import { useEffect, useState } from 'react';
import { Play, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IPTVChannel } from '../types/iptv';
import { cn } from '@/lib/utils';

interface TvViewProps {
  channels: IPTVChannel[];
  selectedChannel: IPTVChannel | null;
  playlistName: string;
  onWatch: () => void;
  onSelectChannel: (channel: IPTVChannel) => void;
  onExit: () => void;
}

const Key = ({ k, children }: { k: string; children: React.ReactNode }) => (
  <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
    <Badge variant="neutral" className="text-foreground">{k}</Badge>{children}
  </span>
);

/** Mode TV : grandes cartes, horloge et navigation à la télécommande (← →, Entrée, Échap). */
export default function TvView({ channels, selectedChannel, playlistName, onWatch, onSelectChannel, onExit }: TvViewProps) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
      if (e.key === 'Enter' && selectedChannel && (e.target as HTMLElement).tagName !== 'BUTTON') onWatch();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit, onWatch, selectedChannel]);

  const index = selectedChannel ? channels.findIndex((c) => c.url === selectedChannel.url) : -1;
  const visible = index >= 0 ? Array.from({ length: Math.min(4, channels.length) }, (_, i) => channels[(index + i) % channels.length]) : [];
  const rawDate = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const date = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden p-6 md:px-12 md:py-9"
      style={{ background: 'radial-gradient(70% 90% at 90% 45%, rgba(37,70,230,.75), transparent 65%), #0b0c12' }}
    >
      <div className="flex items-start justify-between">
        <Button variant="outline" onClick={onExit}><LogOut /> Quitter le mode TV</Button>
        <div className="text-right">
          <div className="text-6xl font-light leading-none tabular-nums md:text-8xl">
            {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="mt-2 text-base text-muted-foreground">{date}</div>
        </div>
      </div>

      {selectedChannel ? (
        <>
          <div className="mt-auto">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">En direct · Chaîne {index + 1}{playlistName ? ` · ${playlistName}` : ''}</span>
            <h1 className="my-2 truncate text-5xl font-bold leading-tight md:text-7xl">{selectedChannel.name}</h1>
            <p className="mb-5 text-lg text-muted-foreground">{selectedChannel.group || 'Général'}</p>
            <Button size="lg" onClick={onWatch}><Play fill="currentColor" /> Regarder</Button>
          </div>

          <div className="flex items-end gap-5" role="listbox" aria-label="Chaînes">
            {visible.map((c, i) => (
              <button
                key={`${c.url}-${i}`}
                type="button"
                role="option"
                aria-selected={i === 0}
                onClick={() => (i === 0 ? onWatch() : onSelectChannel(c))}
                className={cn(
                  'flex min-w-0 flex-col justify-between rounded-tile p-5 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring/60',
                  i === 0 ? 'h-52 flex-[1.4] bg-gradient-to-br from-indigo-600 to-blue-800/60 md:h-60' : 'h-44 flex-1 bg-surface-2 hover:bg-white/[0.08]'
                )}
              >
                <Badge variant={i === 0 ? 'inverse' : 'neutral'} className="self-start">{i === 0 ? 'DIRECT' : `CH ${((index + i) % channels.length) + 1}`}</Badge>
                <span className="min-w-0">
                  <span className="block truncate text-lg font-semibold">{c.name}</span>
                  <span className="block truncate text-sm text-white/70">{c.group || 'Général'}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="m-auto max-w-md text-center">
          <h1 className="text-4xl font-bold">Aucune chaîne</h1>
          <p className="mt-3 text-muted-foreground">Charge une source depuis l'Explorer pour utiliser le mode TV.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-6">
        <Key k="← →">Zapper</Key>
        <Key k="Entrée">Regarder</Key>
        <Key k="Échap">Quitter</Key>
      </div>
    </div>
  );
}
