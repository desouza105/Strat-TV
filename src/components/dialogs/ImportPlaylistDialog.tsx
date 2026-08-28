import React, { useState } from 'react';
import { Plus, Link, FileUp, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImportPlaylistDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string, name: string) => void;
}

export function ImportPlaylistDialog({ isOpen, onOpenChange, onSubmit }: ImportPlaylistDialogProps) {
  const [tab, setTab] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleImport = () => {
    if (!url.trim()) {
      setError('Veuillez entrer une URL valide');
      return;
    }
    if (!url.startsWith('http') && !url.startsWith('blob:')) {
      setError('L\'URL doit commencer par http:// ou https://');
      return;
    }
    onSubmit(url, name);
    setUrl('');
    setName('');
    setError('');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const blob = new Blob([content], { type: 'text/plain' });
      const blobUrl = URL.createObjectURL(blob);
      const fileName = file.name.replace('.m3u', '').replace('.m3u8', '');
      onSubmit(blobUrl, fileName);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-primary border border-border">
              <Plus size={28} strokeWidth={2} />
            </div>
          </div>

          <div className="space-y-2 text-center w-full">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Importer une Playlist
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Ajoutez vos propres chaînes via URL ou fichier M3U.
            </DialogDescription>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as 'url'|'file')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary p-1 rounded-xl h-12">
              <TabsTrigger value="url" className="rounded-lg text-xs font-semibold uppercase tracking-wider">
                <Link size={14} className="mr-2" /> URL
              </TabsTrigger>
              <TabsTrigger value="file" className="rounded-lg text-xs font-semibold uppercase tracking-wider">
                <FileUp size={14} className="mr-2" /> Fichier
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="mt-0">
              <div className="flex flex-col gap-4">
                <div className="space-y-3">
                  <Input 
                    type="text" 
                    placeholder="Nom de la playlist (optionnel)"
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 bg-background border-input rounded-xl px-4 text-sm" 
                  />
                  <Input 
                    type="url" 
                    placeholder="https://exemple.com/playlist.m3u"
                    value={url} 
                    onChange={(e) => { setUrl(e.target.value); setError(''); }}
                    className="h-12 bg-background border-input rounded-xl px-4 text-sm" 
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-destructive mt-1 justify-center">
                    <AlertCircle size={12} />
                    <span className="text-xs font-semibold uppercase tracking-wider">{error}</span>
                  </div>
                )}
                <Button onClick={handleImport} size="lg" className="w-full h-12 rounded-xl text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 mt-2">
                  <Plus size={16} />
                  CHARGER LA PLAYLIST
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="mt-0">
              <label className="flex flex-col items-center justify-center gap-4 p-8 h-[220px] border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all group">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                  <FileUp size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-sm font-semibold tracking-wide text-foreground">Parcourir les fichiers</p>
                  <p className="text-xs text-muted-foreground font-medium tracking-wide">Formats acceptés : .m3u, .m3u8</p>
                </div>
                <input type="file" accept=".m3u,.m3u8" className="hidden" onChange={handleFileImport} />
              </label>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
