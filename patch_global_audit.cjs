const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalPlayer.tsx', 'utf8');

content = content.replace(
  /className=\{`grid gap-6 w-full max-w-7xl z-10 \$\{\s*splitChannels\.length <= 1 \? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'\s*\}`\}/g,
  'className={cn("grid gap-6 w-full max-w-7xl z-10 animate-in fade-in zoom-in-[0.98] duration-500", splitChannels.length <= 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}'
);

content = content.replace(
  /className=\{`relative flex flex-col rounded-2xl overflow-hidden border-2 transition-all group \$\{\s*activeSplitIndex === idx \? 'border-primary ring-4 ring-primary\/10 shadow-2xl' : 'border-border'\s*\} \$\{\!channel \? 'bg-card\/50 border-dashed justify-center items-center cursor-pointer hover:bg-card' : 'bg-card'\}`\}/g,
  'className={cn("relative flex flex-col rounded-2xl overflow-hidden border-2 transition-all group", activeSplitIndex === idx ? "border-primary ring-4 ring-primary/10 shadow-2xl" : "border-border", !channel ? "bg-card/50 border-dashed justify-center items-center cursor-pointer hover:bg-card" : "bg-card")}'
);

fs.writeFileSync('src/components/GlobalPlayer.tsx', content);
