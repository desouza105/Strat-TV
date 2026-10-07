const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalPlayer.tsx', 'utf8');

content = content.replace(
  '<button onClick={(e) => { e.stopPropagation(); setIsMiniPlayer(false); }} className="p-1.5 bg-black/50 hover:bg-white/20 rounded-lg transition-colors text-white">',
  '<button aria-label="Fermer le mini player" onClick={(e) => { e.stopPropagation(); setIsMiniPlayer(false); }} className="p-1.5 bg-black/50 hover:bg-white/20 rounded-lg transition-colors text-white">'
);

content = content.replace(
  '<button onClick={(e) => { e.stopPropagation(); playerRef.current?.toggleFullscreen(); }} className="p-1.5 bg-black/50 hover:bg-white/20 rounded-lg transition-colors text-white">',
  '<button aria-label="Plein écran" onClick={(e) => { e.stopPropagation(); playerRef.current?.toggleFullscreen(); }} className="p-1.5 bg-black/50 hover:bg-white/20 rounded-lg transition-colors text-white">'
);

content = content.replace(
  '<button onClick={() => setActiveSplitIndex(index)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">',
  '<button aria-label="Sélectionner cette vue" onClick={() => setActiveSplitIndex(index)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">'
);

fs.writeFileSync('src/components/GlobalPlayer.tsx', content);
