const fs = require('fs');
let content = fs.readFileSync('src/components/VideoPlayer.tsx', 'utf8');

// Replace button opening tags to include aria labels where obviously missing
content = content.replace(
  '<button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="p-4 rounded-full bg-black/40 text-white hover:bg-primary hover:scale-110 transition-all backdrop-blur-md">',
  '<button aria-label={isPlaying ? "Pause" : "Play"} onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="p-4 rounded-full bg-black/40 text-white hover:bg-primary hover:scale-110 transition-all backdrop-blur-md">'
);

content = content.replace(
  '<button onClick={toggleMute} className="text-white hover:text-primary transition-colors flex items-center justify-center w-8">',
  '<button aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"} onClick={toggleMute} className="text-white hover:text-primary transition-colors flex items-center justify-center w-8">'
);

content = content.replace(
  '<button onClick={() => setShowTracksMenu(!showTracksMenu)} className={cn("p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg transition-all hover:bg-muted", showTracksMenu ? "text-foreground bg-muted" : "text-muted-foreground")}>',
  '<button aria-label="Audio and Subtitle tracks" aria-expanded={showTracksMenu} onClick={() => setShowTracksMenu(!showTracksMenu)} className={cn("p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg transition-all hover:bg-muted", showTracksMenu ? "text-foreground bg-muted" : "text-muted-foreground")}>'
);

content = content.replace(
  '<button onClick={() => setIsQualityOpen(!isQualityOpen)} className="p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 text-muted-foreground hover:text-foreground hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">',
  '<button aria-label="Quality settings" aria-expanded={isQualityOpen} onClick={() => setIsQualityOpen(!isQualityOpen)} className="p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 text-muted-foreground hover:text-foreground hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">'
);

content = content.replace(
  '<button onClick={handleCast} className={cn("p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors", castState === "connected" ? "text-primary" : "text-foreground")}>',
  '<button aria-label="Cast to TV" onClick={handleCast} className={cn("p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors", castState === "connected" ? "text-primary" : "text-foreground")}>'
);

content = content.replace(
  '<button onClick={togglePip} className="p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 text-muted-foreground hover:text-foreground hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">',
  '<button aria-label="Picture in Picture" onClick={togglePip} className="p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 text-muted-foreground hover:text-foreground hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">'
);

content = content.replace(
  '<button onClick={toggleFullscreen} className="p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 text-muted-foreground hover:text-foreground hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">',
  '<button aria-label="Fullscreen" onClick={toggleFullscreen} className="p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 text-muted-foreground hover:text-foreground hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">'
);

fs.writeFileSync('src/components/VideoPlayer.tsx', content);
