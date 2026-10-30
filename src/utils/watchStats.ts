export interface WatchSession {
  channelName: string;
  channelGroup: string;
  startTime: number;   // timestamp ms
  duration: number;    // secondes
}

import { STORAGE_KEYS } from './storage';

const STORAGE_KEY = STORAGE_KEYS.watchStats;

export const getSessions = (): WatchSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const addSession = (session: WatchSession) => {
  if (session.duration < 5) return; // ignore < 5 secondes
  const sessions = getSessions();
  sessions.push(session);
  // Garde max 500 sessions (environ 3 mois)
  if (sessions.length > 500) sessions.splice(0, sessions.length - 500);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.warn('Failed to save watch stats to localStorage:', err);
  }
};

export const clearSessions = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Retourne les données pour le graphique hebdo (7 derniers jours)
export const getWeeklyData = () => {
  const sessions = getSessions();
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const result = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStart = new Date(date).setHours(0,0,0,0);
    const dayEnd = new Date(date).setHours(23,59,59,999);
    const total = sessions
      .filter(s => s.startTime >= dayStart && s.startTime <= dayEnd)
      .reduce((acc, s) => acc + s.duration, 0);
    return { 
      day: days[date.getDay()], 
      minutes: Math.round(total / 60) 
    };
  });
  return result;
};

// Top 5 chaînes par temps de visionnage
export const getTopChannels = () => {
  const sessions = getSessions();
  const map: Record<string, number> = {};
  sessions.forEach(s => {
    map[s.channelName] = (map[s.channelName] || 0) + s.duration;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, secs]) => ({ 
      name: name.length > 16 ? name.slice(0, 14) + '…' : name, 
      minutes: Math.round(secs / 60) 
    }));
};

// Répartition par catégorie (pour PieChart)
export const getCategoryBreakdown = () => {
  const sessions = getSessions();
  const map: Record<string, number> = {};
  sessions.forEach(s => {
    const grp = s.channelGroup || 'Autre';
    map[grp] = (map[grp] || 0) + s.duration;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, secs]) => ({ 
      name, 
      value: Math.round(secs / 60) 
    }));
};

export const getTotalTime = (): number => {
  return getSessions().reduce((acc, s) => acc + s.duration, 0);
};

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
  return `${m}min`;
};
