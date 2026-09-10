const fs = require('fs');
let content = fs.readFileSync('src/components/VideoPlayer.tsx', 'utf8');

// Ensure cn is imported
if (!content.includes('import { cn } from')) {
  content = content.replace(
    'import { motion, AnimatePresence } from \'motion/react\';',
    'import { motion, AnimatePresence } from \'motion/react\';\nimport { cn } from \'@/lib/utils\';'
  );
}

const replaces = [
  {
    regex: /className=\{`w-3\.5 h-3\.5 \$\{isQualityOpen \? 'animate-spin-slow' : ''\}`\}/g,
    replacement: 'className={cn("w-3.5 h-3.5", isQualityOpen && "animate-spin-slow")}'
  },
  {
    regex: /className=\{`w-full px-4 py-2 text-left text-xs font-semibold transition-colors \$\{currentLevel === -1 \? 'bg-primary\/10 text-primary' : 'text-foreground hover:bg-muted'\}`\}/g,
    replacement: 'className={cn("w-full px-4 py-2 text-left text-xs font-semibold transition-colors", currentLevel === -1 ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}'
  },
  {
    regex: /className=\{`w-full px-4 py-2 text-left text-xs font-semibold transition-colors \$\{currentLevel === level\.index \? 'bg-primary\/10 text-primary' : 'text-foreground hover:bg-muted'\}`\}/g,
    replacement: 'className={cn("w-full px-4 py-2 text-left text-xs font-semibold transition-colors", currentLevel === level.index ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}'
  },
  {
    regex: /className=\{`p-2 flex items-center justify-center min-w-\[44px\] min-h-\[44px\] md:min-w-0 md:min-h-0 hover:bg-white\/20 rounded-full transition-colors \$\{castState === 'connected' \? 'text-primary' : 'text-foreground'\}`\}/g,
    replacement: 'className={cn("p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors", castState === "connected" ? "text-primary" : "text-foreground")}'
  },
  {
    regex: /className=\{`w-5 h-5 \$\{castState === 'connected' \? 'fill-current' : ''\}`\}/g,
    replacement: 'className={cn("w-5 h-5", castState === "connected" && "fill-current")}'
  },
  {
    regex: /className=\{`p-2 min-w-\[44px\] min-h-\[44px\] md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg transition-all hover:bg-muted \$\{showTracksMenu \? 'text-foreground bg-muted' : 'text-muted-foreground'\}`\}/g,
    replacement: 'className={cn("p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg transition-all hover:bg-muted", showTracksMenu ? "text-foreground bg-muted" : "text-muted-foreground")}'
  },
  {
    regex: /className=\{`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors \$\{activeAudio === track\.id \? 'bg-primary\/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'\}`\}/g,
    replacement: 'className={cn("flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors", activeAudio === track.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}'
  },
  {
    regex: /className=\{`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors \$\{activeSubtitle === -1 \? 'bg-primary\/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'\}`\}/g,
    replacement: 'className={cn("flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors", activeSubtitle === -1 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}'
  },
  {
    regex: /className=\{`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors \$\{activeSubtitle === track\.id \? 'bg-primary\/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'\}`\}/g,
    replacement: 'className={cn("flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors", activeSubtitle === track.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}'
  },
  {
    regex: /className=\{`p-2 min-w-\[44px\] min-h-\[44px\] md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg transition-all hover:bg-white\/10 \$\{sleepTimerActive \? 'text-primary' : 'text-muted-foreground'\}`\}/g,
    replacement: 'className={cn("p-2 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center rounded-lg transition-all hover:bg-white/10", sleepTimerActive ? "text-primary" : "text-muted-foreground")}'
  }
];

replaces.forEach(r => {
  content = content.replace(r.regex, r.replacement);
});

fs.writeFileSync('src/components/VideoPlayer.tsx', content);
