const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalPlayer.tsx', 'utf8');

if (!content.includes('import { cn } from')) {
  content = content.replace(
    'import { motion, AnimatePresence } from \'motion/react\';',
    'import { motion, AnimatePresence } from \'motion/react\';\nimport { cn } from \'@/lib/utils\';'
  );
}

content = content.replace(
  /className=\{`grid gap-6 w-full max-w-7xl z-10 \$\{splitChannels\.length <= 1 \? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'\}`\}/g,
  'className={cn("grid gap-6 w-full max-w-7xl z-10", splitChannels.length <= 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}'
);

content = content.replace(
  /className=\{`relative flex flex-col rounded-2xl overflow-hidden border-2 transition-all group \$\{activeSplitIndex === index \? 'border-primary ring-2 ring-primary\/50 shadow-2xl shadow-primary\/20' : 'border-border\/50 hover:border-primary\/30 opacity-70 hover:opacity-100'\}`\}/g,
  'className={cn("relative flex flex-col rounded-2xl overflow-hidden border-2 transition-all group", activeSplitIndex === index ? "border-primary ring-2 ring-primary/50 shadow-2xl shadow-primary/20" : "border-border/50 hover:border-primary/30 opacity-70 hover:opacity-100")}'
);

fs.writeFileSync('src/components/GlobalPlayer.tsx', content);
