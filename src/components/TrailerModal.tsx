import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrailerModalProps {
  videoKey: string;
  title: string;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ videoKey, title, onClose }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-4xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground font-bold text-lg truncate pr-4">{title}</h3>
          <Button
            onClick={onClose}
            variant="outline" size="icon" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-foreground border-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full rounded-xl"
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; fullscreen"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      </div>
    </div>
  );
};
