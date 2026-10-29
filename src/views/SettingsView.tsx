import { useMemo, useState } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { getCustomPlaylists, deleteCustomPlaylist, PlaylistSource } from '../constants/portal_data';
import { clearSessions, getSessions, formatDuration, getTotalTime } from '../utils/watchStats';
import { QUICK_SOURCES } from './HomeView';
import { cn } from '@/lib/utils';

interface SettingsViewProps {
  playlistName: string;
  isLoading: boolean;
  channelStatus: Record<string, 'checking' | 'active' | 'dead'>;
  highContrast: boolean;
  onHighContrastChange: (v: boolean) => void;
  onLoadPlaylist: (url: string) => void;
  onRefresh: () => void;
  onImport: () => void;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs uppercase tracking-widest text-muted-foreground">{children}</h2>
);

function Gauge({ percent, label }: { percent: number; label: string }) {
  return (
    <svg viewBox="0 0 200 120" className="w-full max-w-xs" role="img" aria-label={`${percent} % ${label}`}>
      <defs>
        <linearGradient id="health-grad" x1="0" x2="1">
          <stop offset="0" stopColor="#4338ca" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <path d="M20 105A80 80 0 0 1 180 105" pathLength={100} fill="none" stroke="#2a2b33" strokeWidth={14} strokeLinecap="round" />
      <path d="M20 105A80 80 0 0 1 180 105" pathLength={100} fill="none" stroke="url(#health-grad)" strokeWidth={14} strokeLinecap="round" strokeDasharray={`${percent} 100`} />
      <text x="100" y="86" textAnchor="middle" fill="#f4f4f5" fontSize="32" fontWeight="300">{percent} %</text>
      <text x="100" y="106" textAnchor="middle" fill="#a3a3ad" fontSize="11">{label}</text>
    </svg>
  );
}

export default function SettingsView({ playlistName, isLoading, channelStatus, highContrast, onHighContrastChange, onLoadPlaylist, onRefresh, onImport }: SettingsViewProps) {
  const [custom, setCustom] = useState<PlaylistSource[]>(() => getCustomPlaylists());
  const [sessionsCount, setSessionsCount] = useState(() => getSessions().length);

  const counts = useMemo(() => {
    const v = Object.values(channelStatus);
    return { active: v.filter((s) => s === 'active').length, dead: v.filter((s) => s === 'dead').length, checking: v.filter((s) => s === 'checking').length, total: v.length };
  }, [channelStatus]);
  const checked = counts.active + counts.dead;
  const percent = checked ? Math.round((counts.active / checked) * 100) : 0;

  const sourceCard = (name: string, label: string, url: string, removable?: boolean) => {
    const on = playlistName === name;
    return (
      <div key={url} className={cn('flex h-[150px] min-w-0 flex-col justify-between rounded-card border border-white/[0.06] p-5', on ? 'bg-gradient-to-br from-mint/60 to-indigo-700/60' : 'bg-card')}>
        <div className="flex items-center justify-between">
          <span className="grid size-9 place-items-center rounded-btn bg-primary text-[13px] font-bold text-primary-foreground">{label.slice(0, 2).toUpperCase()}</span>
          <div className="flex items-center gap-2">
            {removable && (
              <Button variant="ghost" size="icon-sm" aria-label={`Supprimer ${label}`} onClick={() => { deleteCustomPlaylist(url); setCustom(getCustomPlaylists()); }}><Trash2 /></Button>
            )}
            <Switch checked={on} label={`Charger la source ${label}`} disabled={isLoading} onCheckedChange={(v) => v && onLoadPlaylist(url)} />
          </div>
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">{label}</div>
          <div className={cn('text-[13px]', on ? 'text-white/80' : 'text-muted-foreground')}>{on ? 'Chargée' : 'Disponible'}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 md:py-7 md:pr-9 md:pl-2">
      <h1 className="text-2xl font-semibold leading-9 md:text-[30px]">Sources &amp; réglages</h1>

      <div className="grid gap-5 lg:grid-cols-3">
        <section aria-label="Sources" className="flex flex-col gap-3 lg:col-span-2">
          <SectionTitle>Sources</SectionTitle>
          <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
            {QUICK_SOURCES.map((s) => sourceCard(s.name, s.label, s.url))}
            {custom.map((c) => sourceCard(c.name, c.name, c.url, true))}
          </div>
          <div className="mt-1 flex items-center gap-3 rounded-card border-2 border-dashed border-white/15 p-5">
            <div className="flex-1">
              <div className="font-semibold">Ajouter une source</div>
              <div className="text-[13px] text-muted-foreground">Lien d'une playlist M3U ou fichier local.</div>
            </div>
            <Button onClick={onImport}><Plus /> Importer</Button>
          </div>
        </section>

        <section aria-label="Santé des chaînes" className="flex flex-col rounded-card border border-white/[0.06] bg-card p-6">
          <div className="flex items-center justify-between">
            <SectionTitle>Santé des chaînes</SectionTitle>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading || counts.total === 0}><RefreshCw /> Actualiser</Button>
          </div>
          <div className="flex flex-1 items-center justify-center py-4">
            {counts.total === 0 ? (
              <p className="text-center text-sm text-muted-foreground">Charge une source pour vérifier ses chaînes.</p>
            ) : (
              <Gauge percent={percent} label={counts.checking ? 'vérification en cours…' : 'chaînes en ligne'} />
            )}
          </div>
          <div className="flex flex-wrap gap-5 text-[13px] text-muted-foreground">
            <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-mint" /> En ligne : {counts.active}</span>
            <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-destructive" /> Hors ligne : {counts.dead}</span>
          </div>
        </section>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section aria-label="Affichage" className="flex flex-col gap-4 rounded-card border border-white/[0.06] bg-card p-6">
          <SectionTitle>Affichage</SectionTitle>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Contraste élevé</div>
              <div className="text-[13px] text-muted-foreground">Bordures et textes plus marqués.</div>
            </div>
            <Switch checked={highContrast} label="Contraste élevé" onCheckedChange={onHighContrastChange} />
          </div>
        </section>

        <section aria-label="Données" className="flex flex-col gap-4 rounded-card border border-white/[0.06] bg-card p-6">
          <SectionTitle>Données</SectionTitle>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Historique de visionnage</div>
              <div className="text-[13px] text-muted-foreground">{sessionsCount} séance{sessionsCount > 1 ? 's' : ''} · {formatDuration(getTotalTime())} au total</div>
            </div>
            <Button variant="outline" disabled={sessionsCount === 0} onClick={() => { if (window.confirm("Effacer tout l'historique de visionnage ?")) { clearSessions(); setSessionsCount(0); } }}>
              <Trash2 /> Effacer
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
