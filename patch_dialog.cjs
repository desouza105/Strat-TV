const fs = require('fs');
let content = fs.readFileSync('src/components/dialogs/PinCodeDialog.tsx', 'utf8');

if (!content.includes('import { cn } from')) {
  content = content.replace(
    'import { Lock } from \'lucide-react\';',
    'import { Lock } from \'lucide-react\';\nimport { cn } from \'@/lib/utils\';'
  );
}

content = content.replace(
  /className=\{`h-14 text-center text-2xl tracking-\[0\.3em\] bg-background border-2 \$\{error \? 'border-destructive text-destructive' : 'border-input focus-visible:ring-1 focus-visible:ring-primary'\} rounded-xl`\}/g,
  'className={cn("h-14 text-center text-2xl tracking-[0.3em] bg-background border-2 rounded-xl", error ? "border-destructive text-destructive" : "border-input focus-visible:ring-1 focus-visible:ring-primary")}'
);

fs.writeFileSync('src/components/dialogs/PinCodeDialog.tsx', content);
