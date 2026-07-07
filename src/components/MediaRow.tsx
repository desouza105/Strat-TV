import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../types/media';
import { MediaCard } from './MediaCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MediaRowProps {
  title: string;
  items: MediaItem[];
  isLoading: boolean;
  supportsToggle?: boolean;
}

export const MediaRow: React.FC<MediaRowProps> = ({ title, items, isLoading, supportsToggle }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 600 : scrollLeft + 600;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.media_type === filter);

  return (
    <div className="mb-10 group/row relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground text-lg font-bold border-l-[3px] border-primary pl-3 leading-tight">{title}</h2>
          
          {supportsToggle && (
            <Tabs value={filter} onValueChange={(val) => setFilter(val as any)} className="w-auto">
              <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 space-x-4">
                <TabsTrigger 
                  value="all" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent px-0 pb-1 pt-0 transition-colors"
                >
                  Tous
                </TabsTrigger>
                <TabsTrigger 
                  value="movie" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent px-0 pb-1 pt-0 transition-colors"
                >
                  Films
                </TabsTrigger>
                <TabsTrigger 
                  value="tv" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent px-0 pb-1 pt-0 transition-colors"
                >
                  Séries
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
        
        <div className="relative">
          {/* Left arrow */}
          <Button 
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="absolute left-0 top-[40%] -translate-y-1/2 -ml-4 z-20 w-10 h-10 rounded-full bg-black/80 border-white/20 text-foreground flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black hover:scale-110 hidden md:flex"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <div 
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-4 scroll-smooth" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {isLoading ? (
              // Skeleton loader
              Array.from({ length: 6 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className="flex-shrink-0 flex flex-col gap-2"
                  style={{ width: 'clamp(120px, 28vw, 200px)' }}
                >
                  <div className="aspect-[2/3] bg-card rounded-xl animate-pulse" />
                  <div className="h-4 bg-card w-3/4 rounded animate-pulse" />
                  <div className="h-3 bg-card w-1/2 rounded animate-pulse" />
                </div>
              ))
            ) : (
              filteredItems.map(item => (
                <div 
                  key={`${item.media_type}-${item.id}`} 
                  className="flex-shrink-0"
                  style={{ width: 'clamp(120px, 28vw, 200px)' }}
                >
                  <MediaCard item={item} />
                </div>
              ))
            )}
          </div>

          {/* Right arrow */}
          <Button 
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="absolute right-0 top-[40%] -translate-y-1/2 -mr-4 z-20 w-10 h-10 rounded-full bg-black/80 border-white/20 text-foreground flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black hover:scale-110 hidden md:flex"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};
