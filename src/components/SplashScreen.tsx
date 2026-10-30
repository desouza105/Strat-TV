import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const DURATION_MS = 1600;

/** Écran de démarrage : mot-symbole Strat·TV et barre de progression (animée en CSS, sans re-rendus). */
export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = window.requestAnimationFrame(() => setStarted(true));
    const done = window.setTimeout(onComplete, reduced ? 300 : DURATION_MS + 200);
    return () => { window.cancelAnimationFrame(start); window.clearTimeout(done); };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-background"
      style={{ background: 'radial-gradient(60% 70% at 50% 40%, rgba(52,211,153,.14), transparent 65%), #0d0e13' }}
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-3"
      >
        <h1 className="text-6xl font-bold tracking-tight md:text-7xl">
          STRAT<span className="text-mint">·</span>TV
        </h1>
        <p className="text-sm text-muted-foreground">La télévision en direct, simplement.</p>
      </motion.div>

      <div className="flex w-44 flex-col items-center gap-3">
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary" aria-hidden="true">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-mint"
            style={{ width: started ? '100%' : '0%', transition: `width ${DURATION_MS}ms cubic-bezier(.4,0,.2,1)` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">Chargement…</span>
      </div>
    </motion.div>
  );
}
