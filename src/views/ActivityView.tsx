import { useMemo, useState } from 'react';
import { getSessions, getWeeklyData, formatDuration } from '../utils/watchStats';
import { cn } from '@/lib/utils';

interface ActivityViewProps {
  statsVersion: number;
}

type Tab = 'days' | 'channels' | 'genres';
const TABS: { id: Tab; label: string }[] = [
  { id: 'days', label: 'Jours' },
  { id: 'channels', label: 'Chaînes' },
  { id: 'genres', label: 'Genres' },
];

function aggregate(entries: { key: string; secs: number }[]) {
  const map = new Map<string, { secs: number; count: number }>();
  entries.forEach(({ key, secs }) => {
    const cur = map.get(key) ?? { secs: 0, count: 0 };
    map.set(key, { secs: cur.secs + secs, count: cur.count + 1 });
  });
  return [...map.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.secs - a.secs);
}

export default function ActivityView({ statsVersion }: ActivityViewProps) {
  const [tab, setTab] = useState<Tab>('days');

  const data = useMemo(() => {
    const sessions = getSessions();
    const total = sessions.reduce((a, s) => a + s.duration, 0);
    const channels = aggregate(sessions.map((s) => ({ key: s.channelName, secs: s.duration })));
    const genres = aggregate(sessions.map((s) => ({ key: s.channelGroup || 'Autre', secs: s.duration })));
    const week = getWeeklyData();
    return { sessions, total, channels, genres, week };
  }, [statsVersion]);

  const empty = data.sessions.length === 0;
  const topGenre = data.genres[0];
  const topGenrePercent = topGenre && data.total ? Math.round((topGenre.secs / data.total) * 100) : 0;

  const bars = useMemo(() => {
    if (tab === 'days') return data.week.map((d) => ({ label: d.day.toUpperCase(), value: d.minutes }));
    const list = tab === 'channels' ? data.channels : data.genres;
    return list.slice(0, 7).map((x) => ({ label: x.name.length > 10 ? `${x.name.slice(0, 9)}…` : x.name, value: Math.round(x.secs / 60) }));
  }, [tab, data]);
  const maxValue = Math.max(1, ...bars.map((b) => b.value));
  const avg = bars.length ? bars.reduce((a, b) => a + b.value, 0) / bars.length : 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 md:py-7 md:pr-9 md:pl-2">
      <h1 className="text-2xl font-semibold leading-9 md:text-[30px]">Activité</h1>

      <div className="grid gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
        {/* Aperçu */}
        <section
          className="flex min-h-[260px] flex-col rounded-card border border-white/[0.06] p-6"
          style={{ background: 'radial-gradient(90% 80% at 0% 10%, rgba(34,197,94,.75), transparent 55%), radial-gradient(70% 60% at 5% 85%, rgba(234,138,60,.6), transparent 60%), #15161b' }}
        >
          <span className="text-xs uppercase tracking-widest text-white/80">Aperçu · depuis le début</span>
          <div className="mt-7 text-7xl font-light leading-none">{empty ? '—' : `${topGenrePercent} %`}</div>
          <p className="mt-auto text-lg">
            {empty ? (
              <span className="text-white/80">Regarde une chaîne : tes séances apparaîtront ici.</span>
            ) : (
              <>de ton temps sur <span className="text-white/75">le genre {topGenre.name}.</span></>
            )}
          </p>
        </section>

        {/* Graphique */}
        <section className="flex min-w-0 flex-col rounded-card border border-white/[0.06] bg-card p-6">
          <div role="tablist" aria-label="Période d'analyse" className="flex gap-6 border-b border-border">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn('-mb-px border-b-2 py-2.5 text-sm outline-none focus-visible:text-foreground', tab === t.id ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="mt-6 flex min-h-[220px] flex-1 flex-col gap-6 sm:flex-row">
            <div className="shrink-0 sm:w-48">
              <div className="text-5xl font-light leading-none">{formatDuration(data.total)}</div>
              <div className="mt-2 text-[13px] text-muted-foreground">de visionnage au total</div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2" role="img" aria-label="Temps de visionnage en minutes">
              <div className="relative flex min-h-[160px] flex-1 items-end gap-3">
                {bars.map((b, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-[10px] bg-gradient-to-b from-mint to-white/[0.03]"
                    style={{ height: `${Math.max(3, (b.value / maxValue) * 100)}%`, opacity: b.value ? 1 : 0.25 }}
                    title={`${b.label} : ${b.value} min`}
                  />
                ))}
                {avg > 0 && <div className="absolute inset-x-0 border-t border-dashed border-white/30" style={{ bottom: `${(avg / maxValue) * 100}%` }} />}
              </div>
              <div className="flex gap-3">
                {bars.map((b, i) => <span key={i} className="flex-1 truncate text-center text-xs text-muted-foreground">{b.label}</span>)}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Tableau */}
      <section aria-label="Chaînes les plus regardées" className="overflow-hidden rounded-card border border-white/[0.06] bg-card">
        <h2 className="px-6 pb-2 pt-4 font-semibold">Chaînes les plus regardées</h2>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-6 py-3 text-[13px] text-muted-foreground">
          <span>Chaîne</span><span>Durée</span><span>Séances</span><span>Part</span>
        </div>
        {data.channels.slice(0, 6).map((c, i) => (
          <div key={c.name} className={cn('grid grid-cols-[2fr_1fr_1fr_1fr] border-t border-white/[0.06] px-6 py-3 text-sm', i === 0 && 'bg-white/[0.03]')}>
            <span className="truncate pr-3">{c.name}</span>
            <span className="text-muted-foreground">{formatDuration(c.secs)}</span>
            <span className="text-muted-foreground">{c.count}</span>
            <span>{data.total ? Math.round((c.secs / data.total) * 100) : 0} %</span>
          </div>
        ))}
        {empty && <p className="border-t border-white/[0.06] px-6 py-6 text-sm text-muted-foreground">Aucune séance enregistrée pour le moment.</p>}
      </section>
    </div>
  );
}
