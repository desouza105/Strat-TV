const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Add import
content = content.replace(
  'import { Button } from \'@/components/ui/button\';',
  'import { Button } from \'@/components/ui/button\';\nimport { cn } from \'@/lib/utils\';'
);

// Replace classNames
content = content.replace(
  /className=\{`bg-card flex flex-col overflow-hidden transition-all duration-300 \$\{([\s\S]*?)\}`\}/g,
  'className={cn("bg-card flex flex-col overflow-hidden transition-all duration-300", $1)}'
);

content = content.replace(
  /className=\{`p-4 border-b border-border space-y-4 \$\{isMobileLandscape \? 'pt-12' : ''\}`\}/g,
  'className={cn("p-4 border-b border-border space-y-4", isMobileLandscape && "pt-12")}'
);

content = content.replace(
  /className=\{`text-\[10px\] font-bold px-2 py-0\.5 rounded transition-colors uppercase tracking-widest \$\{([\s\S]*?)\}`\}/g,
  'className={cn("text-[10px] font-bold px-2 py-0.5 rounded transition-colors uppercase tracking-widest", $1)}'
);

content = content.replace(
  /className=\{`flex items-center gap-3 p-2 rounded-xl transition-all text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary \$\{([\s\S]*?)\}`\}/g,
  'className={cn("flex items-center gap-3 p-2 rounded-xl transition-all text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary", $1)}'
);

content = content.replace(
  /className=\{`absolute -top-1 -right-1 w-2\.5 h-2\.5 rounded-full border-\[2px\] border-background \$\{([\s\S]*?)\}`\}/g,
  'className={cn("absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-[2px] border-background", $1)}'
);

content = content.replace(
  /className=\{`text-sm font-semibold truncate transition-colors \$\{isSelected \? 'text-foreground' : 'group-hover:text-foreground'\}`\}/g,
  'className={cn("text-sm font-semibold truncate transition-colors", isSelected ? "text-foreground" : "group-hover:text-foreground")}'
);

fs.writeFileSync('src/components/Sidebar.tsx', content);
