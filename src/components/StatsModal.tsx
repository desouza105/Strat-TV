import { useEffect, useState } from 'react';
import { X, Tv, BarChart2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  getWeeklyData, getTopChannels, getCategoryBreakdown,
  getTotalTime, formatDuration, clearSessions
} from '../utils/watchStats';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#ffffff', '#a1a1aa', '#71717a', '#52525b', 
                '#3f3f46', '#27272a'];

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center 
      h-40 gap-3 opacity-40">
      <BarChart2 size={32} className="text-zinc-600" />
      <p className="text-sm text-zinc-500">
        Pas encore de données
      </p>
      <p className="text-xs text-zinc-600">
        Regarde quelques chaînes pour voir tes stats
      </p>
    </div>
  );
}

export default function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [topChannels, setTopChannels] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'week' | 'channels' | 'categories'>('week');

  useEffect(() => {
    if (isOpen) {
      setWeeklyData(getWeeklyData());
      setTopChannels(getTopChannels());
      setCategories(getCategoryBreakdown());
      setTotalTime(getTotalTime());
    }
  }, [isOpen]);

  const handleClear = () => {
    if (window.confirm("Effacer tout l'historique de visionnage ?")) {
      clearSessions();
      setWeeklyData(getWeeklyData());
      setTopChannels(getTopChannels());
      setCategories(getCategoryBreakdown());
      setTotalTime(0);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center 
          justify-center">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative z-10 w-[min(680px,95vw)] 
              max-h-[85vh] bg-[#080808] border border-white/10 
              rounded-[32px] flex flex-col overflow-hidden
              shadow-[0_50px_100px_rgba(0,0,0,1)]"
          >
            {/* Header modal */}
            <div className="flex items-center justify-between 
              p-6 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <BarChart2 size={20} className="text-white" />
                <h2 className="text-lg font-black text-white 
                  uppercase tracking-tight">
                  Mes Statistiques
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleClear}
                  className="p-2 rounded-lg hover:bg-red-500/10 
                    text-zinc-600 hover:text-red-400 transition-colors"
                  title="Effacer l'historique">
                  <Trash2 size={16} />
                </button>
                <button onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/5 
                    text-zinc-500 transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-3 p-6 
              border-b border-white/5 flex-shrink-0">
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-white">
                  {formatDuration(totalTime)}
                </p>
                <p className="text-[10px] text-zinc-500 uppercase 
                  tracking-widest mt-1">
                  Temps total
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-white">
                  {topChannels.length}
                </p>
                <p className="text-[10px] text-zinc-500 uppercase 
                  tracking-widest mt-1">
                  Chaînes vues
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-white">
                  {categories.length}
                </p>
                <p className="text-[10px] text-zinc-500 uppercase 
                  tracking-widest mt-1">
                  Catégories
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 mx-6 mt-4 
              bg-white/5 rounded-xl flex-shrink-0">
              {(['week', 'channels', 'categories'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-[10px] 
                    font-black uppercase tracking-wider transition-colors ${
                    activeTab === tab 
                      ? 'bg-white/10 text-white' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}>
                  {tab === 'week' ? '7 Jours' 
                    : tab === 'channels' ? 'Top Chaînes' 
                    : 'Catégories'}
                </button>
              ))}
            </div>

            {/* Charts */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {activeTab === 'week' && (
                <div>
                  <p className="text-xs text-zinc-500 mb-4">
                    Minutes regardées par jour (7 derniers jours)
                  </p>
                  {weeklyData.every(d => d.minutes === 0) ? (
                    <EmptyState />
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={weeklyData} 
                        margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                        <XAxis dataKey="day" 
                          tick={{ fill: '#71717a', fontSize: 11 }} 
                          axisLine={false} tickLine={false} />
                        <YAxis 
                          tick={{ fill: '#71717a', fontSize: 11 }} 
                          axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            background: '#18181b', 
                            border: '1px solid #27272a', 
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                          formatter={(v: number) => [`${v} min`, 'Durée']}
                        />
                        <Bar dataKey="minutes" fill="#ffffff" 
                          radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}

              {activeTab === 'channels' && (
                <div>
                  <p className="text-xs text-zinc-500 mb-4">
                    Top 5 chaînes par temps de visionnage
                  </p>
                  {topChannels.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={topChannels} layout="vertical"
                        margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
                        <XAxis type="number" 
                          tick={{ fill: '#71717a', fontSize: 11 }} 
                          axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" width={100}
                          tick={{ fill: '#a1a1aa', fontSize: 11 }} 
                          axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            background: '#18181b', 
                            border: '1px solid #27272a', 
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                          formatter={(v: number) => [`${v} min`, 'Durée']}
                        />
                        <Bar dataKey="minutes" fill="#ffffff" 
                          radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}

              {activeTab === 'categories' && (
                <div>
                  <p className="text-xs text-zinc-500 mb-4">
                    Répartition du temps par catégorie
                  </p>
                  {categories.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={categories} cx="50%" cy="50%"
                          innerRadius={60} outerRadius={95}
                          paddingAngle={3} dataKey="value"
                        >
                          {categories.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            background: '#18181b', 
                            border: '1px solid #27272a', 
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                          formatter={(v: number) => [`${v} min`, '']}
                        />
                        <Legend 
                          formatter={(value) => (
                            <span style={{ color: '#a1a1aa', fontSize: '11px' }}>
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
