import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { MediaItem } from '../types/media';
import { searchMulti } from '../services/tmdb';
import { MediaCard } from '../components/MediaCard';

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Search logic
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);
      try {
        const data = await searchMulti(debouncedQuery);
        setResults(data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-24 pb-8 min-h-screen bg-background">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-16 relative">
        <div className="relative flex items-center">
          <Search className="absolute left-0 w-8 h-8 text-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher des films, séries..."
            className="w-full bg-transparent text-foreground text-base sm:text-xl md:text-2xl font-medium pl-12 pr-4 py-4 border-b-2 border-white/20 focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
          />
          {isLoading && (
            <Loader2 className="absolute right-0 w-6 h-6 text-primary animate-spin" />
          )}
        </div>
      </div>

      {/* Results Area */}
      <div className="w-full">
        {!debouncedQuery.trim() && !hasSearched && (
          <div className="flex flex-col items-center justify-center pt-20 text-gray-500">
            <Search className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg md:text-xl font-medium text-muted-foreground">
              Trouvez votre prochaine histoire préférée
            </p>
          </div>
        )}

        {isLoading && debouncedQuery.trim() && (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 'clamp(8px, 2vw, 20px)' }}>
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="w-full flex flex-col gap-2">
                <div className="aspect-[2/3] bg-card rounded-xl animate-pulse" />
                <div className="h-4 bg-card w-3/4 rounded animate-pulse" />
                <div className="h-3 bg-card w-1/2 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && hasSearched && results.length > 0 && (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 'clamp(8px, 2vw, 20px)' }}>
            {results.map((item) => (
              <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
            ))}
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && debouncedQuery.trim() && (
          <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
            <p className="text-lg md:text-xl font-medium text-muted-foreground">
              Aucun résultat trouvé pour "{debouncedQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
