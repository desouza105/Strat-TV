const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import { cn } from')) {
  content = content.replace(
    'import { motion, AnimatePresence } from \'motion/react\';',
    'import { motion, AnimatePresence } from \'motion/react\';\nimport { cn } from \'@/lib/utils\';'
  );
}

content = content.replace(
  /className=\{`flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-background relative overflow-y-auto custom-scrollbar transition-colors duration-300 order-1 md:order-2 \$\{isMobileLandscape \? 'min-h-0' : 'min-h-\[50vh\]'\}`\}/g,
  'className={cn("flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-background relative overflow-y-auto custom-scrollbar transition-colors duration-300 order-1 md:order-2", isMobileLandscape ? "min-h-0" : "min-h-[50vh]")}'
);

fs.writeFileSync('src/App.tsx', content);
