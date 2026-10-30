import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../utils/storage';

const KEY = STORAGE_KEYS.highContrast;

/** Mode contraste élevé, mémorisé et appliqué sur <html> (repris de l'ancien en-tête). */
export function useHighContrast() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem(KEY) === 'true'; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', enabled);
    try { localStorage.setItem(KEY, String(enabled)); } catch { /* stockage indisponible */ }
  }, [enabled]);

  return [enabled, setEnabled] as const;
}
