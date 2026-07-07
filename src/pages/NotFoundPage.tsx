import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Play className="w-8 h-8 text-primary" fill="currentColor" />
          <span className="text-2xl font-bold text-foreground">Moody</span>
        </div>
        <h1 className="text-[120px] sm:text-[180px] font-black text-foreground leading-none"
          style={{ WebkitTextStroke: '2px rgba(229,9,20,0.6)' }}>
          404
        </h1>
        <p className="text-xl sm:text-2xl font-bold text-foreground mt-4 mb-2">
          Page introuvable
        </p>
        <p className="text-muted-foreground max-w-md mx-auto mb-10">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button
            onClick={() => navigate('/films/')}
            className="rounded-full font-bold px-8 h-12"
          >
            <Home className="w-5 h-5" />
            Accueil
          </Button>
          <Button
            onClick={() => navigate('/films/search')}
            variant="outline" className="rounded-full font-bold px-8 h-12 border-foreground/30"
          >
            <Search className="w-5 h-5" />
            Rechercher
          </Button>
        </div>
      </div>
    </div>
  );
};
