import React, { useEffect, useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type PinVerification = { ok: true } | { ok: false; message: string };

interface PinCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Vérifie le code (côté serveur) ; l'ouverture de la section est gérée par l'appelant. */
  onVerify: (code: string) => Promise<PinVerification>;
  title: React.ReactNode;
  description: string;
  icon?: React.ReactNode;
}

export function PinCodeDialog({ isOpen, onOpenChange, onVerify, title, description, icon }: PinCodeDialogProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!isOpen) { setInput(''); setError(null); setChecking(false); }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || checking) return;
    setChecking(true);
    const result = await onVerify(input);
    setChecking(false);
    if (result.ok === true) {
      onOpenChange(false);
    } else {
      setError(result.message);
      setInput('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-0 p-7 sm:max-w-[380px]">
        <div className="flex flex-col items-center gap-5">
          <div className="grid size-14 place-items-center rounded-2xl border border-border bg-secondary text-foreground">
            {icon || <Lock size={24} aria-hidden="true" />}
          </div>

          <div className="text-center">
            <DialogTitle className="text-[22px] font-semibold">{title}</DialogTitle>
            <DialogDescription className="mt-1.5 text-sm text-muted-foreground">{description}</DialogDescription>
          </div>

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Input
                aria-label="Code d'accès"
                aria-invalid={!!error}
                autoFocus
                type="password"
                autoComplete="off"
                placeholder="••••••••"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(null); }}
                className={cn('h-12 rounded-btn border bg-background text-center text-lg tracking-[0.25em]', error ? 'border-destructive text-destructive' : 'border-input')}
              />
              <div className="flex h-5 items-center justify-center" role="alert">
                {error && (
                  <span className="flex items-center gap-1.5 text-[13px] text-destructive animate-in fade-in duration-200">
                    <AlertCircle size={14} aria-hidden="true" /> {error}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" className="flex-1" disabled={!input || checking}>{checking ? 'Vérification…' : 'Déverrouiller'}</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
