/**
 * Clés de stockage local de l'application (préfixe « strat-tv- »).
 * `migrateLegacyStorage` recopie une seule fois les anciennes valeurs (favoris, historique,
 * playlists importées, contraste) vers les nouvelles clés, puis supprime les anciennes.
 * À retirer dans quelques versions, quand tous les navigateurs auront migré.
 */
export const STORAGE_KEYS = {
  watchStats: 'strat-tv-watch-stats',
  highContrast: 'strat-tv-high-contrast',
  favorites: 'strat-tv-favorites',
  customPlaylists: 'strat-tv-custom-playlists',
} as const;

const LEGACY: [string, string][] = [
  ['moody-watch-stats', STORAGE_KEYS.watchStats],
  ['moody-high-contrast', STORAGE_KEYS.highContrast],
  ['moody-favorites', STORAGE_KEYS.favorites],
  ['moody-custom-playlists', STORAGE_KEYS.customPlaylists],
];

export function migrateLegacyStorage() {
  try {
    for (const [oldKey, newKey] of LEGACY) {
      const value = localStorage.getItem(oldKey);
      if (value === null) continue;
      if (localStorage.getItem(newKey) === null) localStorage.setItem(newKey, value);
      localStorage.removeItem(oldKey);
    }
  } catch {
    /* stockage indisponible : rien à migrer */
  }
}
