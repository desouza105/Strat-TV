const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Add import
content = content.replace(
  'import { Button } from \'@/components/ui/button\';',
  'import { Button } from \'@/components/ui/button\';\nimport { cn } from \'@/lib/utils\';'
);

content = content.replace(
  /className=\{`\$\{isMobileLandscape \? 'h-10' : 'h-16 md:h-16'\} bg-background\/80 backdrop-blur-md border-b border-border px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300`\}/g,
  'className={cn("bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300", isMobileLandscape ? "h-10" : "h-16 md:h-16")}'
);

content = content.replace(
  /className=\{`w-4 h-4 text-muted-foreground transition-transform \$\{isPortalOpen \? 'rotate-180' : ''\}`\}/g,
  'className={cn("w-4 h-4 text-muted-foreground transition-transform", isPortalOpen && "rotate-180")}'
);

content = content.replace(
  /className=\{`flex items-center gap-2 rounded-xl text-xs px-4 h-10 font-semibold \$\{\!isAdultActive && 'hover:text-destructive hover:bg-destructive\/10'\}`\}/g,
  'className={cn("flex items-center gap-2 rounded-xl text-xs px-4 h-10 font-semibold", !isAdultActive && "hover:text-destructive hover:bg-destructive/10")}'
);

content = content.replace(
  /className=\{`h-10 w-10 shrink-0 rounded-xl \$\{\!isAdultActive && 'hover:bg-destructive\/10 hover:text-destructive'\}`\}/g,
  'className={cn("h-10 w-10 shrink-0 rounded-xl", !isAdultActive && "hover:bg-destructive/10 hover:text-destructive")}'
);

fs.writeFileSync('src/components/Header.tsx', content);
