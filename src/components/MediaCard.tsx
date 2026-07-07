import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { MediaItem } from '../types/media';
import { IMAGE_BASE_URL, POSTER_SIZE } from '../services/tmdb';

interface MediaCardProps {
  item: MediaItem;
}

const isRecentRelease = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const releaseDate = new Date(dateStr);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return releaseDate >= thirtyDaysAgo && releaseDate <= new Date();
};

export const MediaCard: React.FC<MediaCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const isMovie = item.media_type === 'movie';
  const displayTitle = item.title || item.name;
  const year = isMovie 
    ? item.release_date?.substring(0, 4) 
    : item.first_air_date?.substring(0, 4);

  const releaseDate = isMovie ? item.release_date : item.first_air_date;
  const isNew = isRecentRelease(releaseDate);

  const handleClick = () => {
    
navigate(`/films/${isMovie ? 'movie' : 'tv'}/${item.id}`);
  };

  return (
    <Card 
      className="flex flex-col gap-2 group cursor-pointer w-full border-0 bg-transparent shadow-none"
      onClick={handleClick}
    >
      <div className="relative w-full rounded-xl overflow-hidden bg-card border border-border" style={{ paddingBottom: '150%' }}>
        <div className="absolute inset-0">
          {item.poster_path ? (
            <img 
              src={`${IMAGE_BASE_URL}${POSTER_SIZE}${item.poster_path}`} 
              alt={displayTitle}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4 text-center">
              <span className="text-gray-400 font-medium text-sm">{displayTitle}</span>
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-foreground">
              <Play className="w-4 h-4 ml-1" fill="currentColor" />
            </div>
          </div>
          
          {isNew && (
            <div className="absolute top-2 left-2 z-20">
              <span className="bg-primary text-foreground text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">
                NEW
              </span>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="px-1 py-0">
        <h3 className="text-foreground font-medium text-sm line-clamp-1">{displayTitle}</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
          <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
          <span>{item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
          {year && (
            <>
              <span>·</span>
              <span>{year}</span>
            </>
          )}
          <span>·</span>
          <span>{isMovie ? 'Film' : 'Série'}</span>
        </div>
      </CardContent>
    </Card>
  );
};
