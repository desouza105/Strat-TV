import { useCallback, useEffect, useState } from 'react';
import { IPTVChannel } from '../types/iptv';
import { STORAGE_KEYS } from '../utils/storage';

const KEY = STORAGE_KEYS.favorites;

function read(): IPTVChannel[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((c) => c && typeof c.url === 'string' && typeof c.name === 'string') : [];
  } catch {
    return [];
  }
}

/** Chaînes favorites, mémorisées dans le navigateur (indépendantes de la playlist chargée). */
export function useFavorites() {
  const [favorites, setFavorites] = useState<IPTVChannel[]>(read);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(favorites)); } catch { /* stockage indisponible */ }
  }, [favorites]);

  const isFavorite = useCallback((url: string) => favorites.some((c) => c.url === url), [favorites]);

  const toggleFavorite = useCallback((channel: IPTVChannel) => {
    setFavorites((prev) =>
      prev.some((c) => c.url === channel.url)
        ? prev.filter((c) => c.url !== channel.url)
        : [{ id: channel.id, name: channel.name, url: channel.url, logo: channel.logo, group: channel.group, tvgId: channel.tvgId }, ...prev]
    );
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
