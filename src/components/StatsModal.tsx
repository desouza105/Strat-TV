import { useEffect, useState } from 'react';
import { Tv, BarChart2, Trash2 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  getWeeklyData, getTopChannels, getCategoryBreakdown,
  getTotalTime, formatDuration, clearSessions
} from '../utils/watchStats';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#ffffff', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a'];

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-40 gap-3 opacity-60">
      <BarChart2 size={32} className="text-muted-foreground" />
      <p className="text-sm text-foreground">Pas encore de données</p>
      <p className="text-xs text-muted-foreground">Regarde quelques chaînes pour voir tes stats</p>
    </div>
  );
}

export default function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [topChannels, setTopChannels] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [totalTime, setTotalTime] = useState(0);

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card border-border shadow-2xl p-0 gap-0">
        <DialogHeader className="p-6 border-b border-border flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart2 size={24} className="text-primary" />
            <DialogTitle className="text-xl font-bold uppercase tracking-tight">Mes Statistiques</DialogTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClear} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Effacer l'historique">
            <Trash2 size={16} />
          </Button>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 p-6 border-b border-border bg-muted/20">
          <div className="bg-background rounded-2xl p-4 text-center border border-border">
            <p className="text-2xl font-black text-primary">{formatDuration(totalTime)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Temps total</p>
          </div>
          <div className="bg-background rounded-2xl p-4 text-center border border-border">
            <p className="text-2xl font-black text-primary">{topChannels.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Chaînes vues</p>
          </div>
          <div className="bg-background rounded-2xl p-4 text-center border border-border">
            <p className="text-2xl font-black text-primary">{categories.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Catégories</p>
          </div>
        </div>

        <Tabs defaultValue="week" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="w-full grid w-full grid-cols-3">
              <TabsTrigger value="week" className="text-xs font-bold uppercase tracking-wider">7 Jours</TabsTrigger>
              <TabsTrigger value="channels" className="text-xs font-bold uppercase tracking-wider">Top Chaînes</TabsTrigger>
              <TabsTrigger value="categories" className="text-xs font-bold uppercase tracking-wider">Catégories</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6 h-[280px]">
            <TabsContent value="week" className="h-full mt-0">
              {weeklyData.every(d => d.minutes === 0) ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      cursor={{fill: 'hsl(var(--muted))'}}
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontSize: '12px' }}
                      formatter={(v: number) => [`${v} min`, 'Durée']}
                    />
                    <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </TabsContent>

            <TabsContent value="channels" className="h-full mt-0">
              {topChannels.length === 0 ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topChannels} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      cursor={{fill: 'hsl(var(--muted))'}}
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontSize: '12px' }}
                      formatter={(v: number) => [`${v} min`, 'Durée']}
                    />
                    <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </TabsContent>

            <TabsContent value="categories" className="h-full mt-0">
              {categories.length === 0 ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                      {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontSize: '12px' }}
                      formatter={(v: number) => [`${v} min`, '']}
                    />
                    <Legend formatter={(value) => <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '11px' }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
