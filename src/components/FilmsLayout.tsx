import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search, User, Home, Bookmark, History, Play, Clapperboard, Tv } from 'lucide-react';

export const FilmsLayout: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header
        className="fixed top-0 w-full z-50 transition-colors duration-300 bg-background border-b border-border"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          <Link to="/films" className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" fill="currentColor" />
            <span className="text-xl font-bold text-foreground tracking-tight">Moody</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/films" 
              className={`text-sm font-medium transition-colors hover:text-foreground ${location.pathname === '/films' || location.pathname === '/films/' ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Accueil
            </Link>
            <Link
              to="/films/tonight"
              className={`text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1.5 ${location.pathname === '/films/tonight' ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Ce soir
            </Link>
            <Link 
              to="/films/search" 
              className={`text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1 ${location.pathname === '/films/search' ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Recherche
            </Link>
            <Link 
              to="/films/watchlist" 
              className={`text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1 ${location.pathname === '/films/watchlist' ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Ma Liste
            </Link>
            <Link 
              to="/films/history" 
              className={`text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1 ${location.pathname === '/films/history' ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Historique
            </Link>
          </nav>

          <div className="flex items-center gap-6">
            <Link to="/films/search" className="text-foreground hover:text-gray-300 transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            <Link to="/" className="text-sm font-bold bg-white/10 hover:bg-white/20 text-foreground px-3 py-1.5 rounded-xl flex items-center gap-2 transition-colors">
              <Tv className="w-4 h-4" />
              TV EN DIRECT
            </Link>
          </div>
        </div>
      </header>

      <main className="pb-20 md:pb-0 pt-16 flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="w-full bg-background border-t border-border py-6 text-center text-muted-foreground text-sm mt-auto pb-20 md:pb-6 hidden md:block">
        <p>Facilité par le facilitateur</p>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-background/95 backdrop-blur-sm border-t border-border pb-safe">
        <div className="flex items-center justify-around h-16">
          <Link to="/films" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location.pathname === '/films' || location.pathname === '/films/' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Accueil</span>
          </Link>
          <Link to="/films/search" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location.pathname === '/films/search' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Recherche</span>
          </Link>
          <Link to="/films/tonight" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location.pathname === '/films/tonight' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Clapperboard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Ce soir</span>
          </Link>
          <Link to="/films/watchlist" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location.pathname === '/films/watchlist' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Bookmark className="w-5 h-5" />
            <span className="text-[10px] font-medium">Ma liste</span>
          </Link>
          <Link to="/films/history" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location.pathname === '/films/history' ? 'text-primary' : 'text-muted-foreground'}`}>
            <History className="w-5 h-5" />
            <span className="text-[10px] font-medium">Historique</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};;
