import { useMemo, useState } from 'react';
import { Play, Plus, Compass, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { IPTVChannel } from '../types/iptv';
import { getSessions, getWeeklyData, formatDuration } from '../utils/watchStats';
import { cn } from '@/lib/utils';

export const QUICK_SOURCES = [
  { name: 'Afrique TV', label: 'Afrique', url: 'https://tvradiozap.eu/live/d/tvzaf.m3u' },
  { name: 'Europa TV', label: 'Europe', url: 'https://tvradiozap.eu/live/d/tvzeu.m3u' },
  { name: 'World TV', label: 'Monde', url: 'https://tvradiozap.eu/live/d/tvrztv.m3u' },
  { name: 'Regional TV', label: 'Régional', url: 'https://tvradiozap.eu/live/d/tvzreg.m3u' },
];

interface HomeViewProps {
  channels: IPTVChannel[];
  selectedChannel: IPTVChannel | null;
  playlistName: string;
  isLoading: boolean;
  onWatch: () => void;
  onSelectChannel: (channel: IPTVChannel) => void;
  onLoadPlaylist: (url: string) => void;
  onExplore: () => void;
  onImport: () => void;
  onTvMode?: () => void;
  statsVersion?: number;
}

const initials = (name: string) => name.replace(/[^\p{L}\p{N} ]/gu, '').trim().slice(0, 2).toUpperCase() || 'TV';

function Tile({ channel, active, onClick }: { channel: IPTVChannel; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-36 min-w-0 flex-1 flex-col justify-between rounded-tile p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60',
        active ? 'bg-gradient-to-br from-indigo-600 to-blue-800/60' : 'bg-surface-2 hover:bg-white/[0.07]'
      )}
    >
      <span className="flex items-center gap-2">
        {channel.logo ? (
          <img src={channel.logo} alt="" className="size-8 rounded-md bg-white/10 object-contain" referrerPolicy="no-referrer" loading="lazy" />
        ) : null}
        <Badge variant={active ? 'inverse' : 'neutral'}>{active ? 'DIRECT' : initials(channel.name)}</Badge>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-semibold">{channel.name}</span>
        <span className="block truncate text-[13px] text-muted-foreground">{channel.group || 'Général'}</span>
      </span>
    </button>
  );
}

export default function HomeView({
  channels, selectedChannel, playlistName, isLoading, onWatch, onSelectChannel, onLoadPlaylist, onExplore, onImport, onTvMode, statsVersion = 0,
}: HomeViewProps) {
  const [, force] = useState(0);
  const today = useMemo(() => {
    const d = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    return d.charAt(0).toUpperCase() + d.slice(1);
  }, []);

  const week = useMemo(() => getWeeklyData(), [statsVersion]);
  const weekSeconds = week.reduce((a, d) => a + d.minutes, 0) * 60;
  const maxMinutes = Math.max(1, ...week.map((d) => d.minutes));

  const recent = useMemo(() => {
    const names: string[] = [];
    getSessions()
      .sort((a, b) => b.startTime - a.startTime)
      .forEach((s) => { if (!names.includes(s.channelName)) names.push(s.channelName); });
    const found = names.map((n) => channels.find((c) => c.name === n)).filter(Boolean) as IPTVChannel[];
    return (found.length ? found : channels).slice(0, 3);
  }, [channels, statsVersion]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 md:py-7 md:pr-9 md:pl-2">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{today}</p>
          <h1 className="text-2xl font-semibold leading-9 md:text-[30px]">Que regarde-t-on ce soir ?</h1>
        </div>
        <div className="flex gap-3">
          {onTvMode && <Button variant="outline" onClick={onTvMode}><Tv /> Mode TV</Button>}
          <Button variant="outline" onClick={onExplore}><Compass /> Explorer</Button>
          <Button variant="outline" onClick={onImport}><Plus /> Importer</Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px] lg:grid-rows-[minmax(260px,1.3fr)_minmax(200px,1fr)]">
        {/* Hero */}
        <section
          className="flex flex-col justify-between rounded-card border border-white/[0.06] p-7 lg:col-span-2"
          style={{ background: 'radial-gradient(110% 100% at 0% 0%, rgba(52,211,153,.8), transparent 55%), radial-gradient(100% 90% at 100% 15%, rgba(67,56,202,.75), transparent 62%), #15161b' }}
        >
          {selectedChannel ? (
            <>
              <div><Badge variant="overlay">Reprendre</Badge></div>
              <div>
                <span className="text-xs uppercase tracking-widest text-white/80">En direct{playlistName ? ` · ${playlistName}` : ''}</span>
                <h2 className="my-1.5 truncate text-4xl font-bold md:text-[56px] md:leading-tight">{selectedChannel.name}</h2>
                <p className="mb-4 text-[15px] text-white/80">{selectedChannel.group || 'Général'}</p>
                <Button onClick={onWatch}><Play fill="currentColor" /> Regarder</Button>
              </div>
            </>
          ) : (
            <>
              <div><Badge variant="overlay">{isLoading ? 'Chargement…' : 'Bienvenue'}</Badge></div>
              <div>
                <h2 className="mb-2 text-3xl font-bold md:text-5xl">Strat·TV</h2>
                <p className="mb-5 max-w-md text-[15px] text-white/80">Choisis un pays ou un genre, ou importe ta playlist M3U pour charger tes chaînes.</p>
                <div className="flex gap-3">
                  <Button onClick={onExplore}><Compass /> Explorer les sources</Button>
                  <Button variant="outline" onClick={onImport}><Plus /> Importer</Button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Activité */}
        <section className="flex flex-col rounded-card border border-white/[0.06] bg-card p-6 lg:row-span-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Activité · 7 jours</span>
          <div className="mt-5 text-6xl font-light leading-none">{formatDuration(weekSeconds)}</div>
          <p className="mb-5 mt-3 text-[13px] text-muted-foreground">
            {weekSeconds === 0 ? 'Aucune séance enregistrée pour le moment.' : 'de visionnage cette semaine'}
          </p>
          <div className="flex min-h-40 flex-1 items-end gap-3" role="img" aria-label="Temps de visionnage par jour">
            {week.map((d, i) => (
              <div key={i} className="flex h-full flex-1 flex-col justify-end gap-2">
                <div
                  className="w-full rounded-[10px] bg-gradient-to-b from-mint to-white/[0.03]"
                  style={{ height: `${Math.max(4, (d.minutes / maxMinutes) * 100)}%`, opacity: d.minutes ? 1 : 0.25 }}
                />
                <span className="text-center text-xs text-muted-foreground">{d.day.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Reprendre */}
        <section className="flex min-w-0 flex-col rounded-card border border-white/[0.06] bg-card p-6">
          <h3 className="mb-3.5 font-semibold">{recent.length ? 'Reprendre' : 'Chaînes'}</h3>
          {recent.length ? (
            <div className="flex min-h-0 flex-1 gap-3">
              {recent.map((c, i) => (
                <Tile key={c.url} channel={c} active={selectedChannel?.url === c.url || (!selectedChannel && i === 0 && false)} onClick={() => { onSelectChannel(c); onWatch(); }} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune chaîne chargée.</p>
          )}
        </section>

        {/* Sources */}
        <section className="min-h-0 overflow-y-auto rounded-card border border-white/[0.06] bg-card p-6">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Sources rapides</span>
          <ul className="mt-3 flex flex-col gap-1.5">
            {QUICK_SOURCES.map((s) => {
              const on = playlistName === s.name;
              return (
                <li key={s.name} className={cn('flex items-center gap-3.5 rounded-2xl px-3 py-1.5', on && 'bg-mint/10')}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-btn bg-primary text-[13px] font-bold text-primary-foreground">{s.label.slice(0, 2)}</span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-semibold">{s.label}</span>
                    <span className="block text-[13px] text-muted-foreground">{on ? 'Chargée' : 'Disponible'}</span>
                  </span>
                  <Switch
                    checked={on}
                    label={`Charger la source ${s.label}`}
                    disabled={isLoading}
                    onCheckedChange={(v) => { if (v) { onLoadPlaylist(s.url); force((n) => n + 1); } }}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
