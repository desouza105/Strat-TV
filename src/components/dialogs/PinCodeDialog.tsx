import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PinCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title: React.ReactNode;
  description: string;
  secretCode: string;
  icon?: React.ReactNode;
}

export function PinCodeDialog({ isOpen, onOpenChange, onSuccess, title, description, secretCode, icon }: PinCodeDialogProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === secretCode) {
      onSuccess();
      onOpenChange(false);
      setInput('');
      setError(false);
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center text-primary border border-border">
              {icon || <Lock size={36} strokeWidth={1.5} />}
            </div>
          </div>
          
          <div className="space-y-2 text-center">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Input 
                autoFocus
                type="password"
                placeholder="••••••••"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(false);
                }}
                className={`h-14 text-center text-2xl tracking-[0.3em] bg-background border-2 ${error ? 'border-destructive text-destructive' : 'border-input focus-visible:ring-1 focus-visible:ring-primary'} rounded-xl`}
              />
              
              <div className="h-5 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-1.5 text-destructive"
                    >
                      <AlertCircle size={14} />
                      <span className="text-xs font-semibold uppercase tracking-wider">Code invalide</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Button 
              type="submit"
              size="lg"
              className="w-full h-12 rounded-xl text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} />
              DÉVERROUILLER
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
