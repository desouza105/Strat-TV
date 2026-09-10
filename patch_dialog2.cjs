const fs = require('fs');
let content = fs.readFileSync('src/components/dialogs/PinCodeDialog.tsx', 'utf8');

content = content.replace(
  'import { motion, AnimatePresence } from \'motion/react\';\n',
  ''
);

content = content.replace(
  /<AnimatePresence mode="wait">\s*\{error && \(\s*<motion\.div\s*initial=\{\{ opacity: 0, y: -5 \}\} animate=\{\{ opacity: 1, y: 0 \}\} exit=\{\{ opacity: 0, y: -5 \}\}\s*className="flex items-center gap-1\.5 text-destructive"\s*>\s*<AlertCircle size=\{14\} \/>\s*<span className="text-xs font-semibold uppercase tracking-wider">Code invalide<\/span>\s*<\/motion\.div>\s*\)\}\s*<\/AnimatePresence>/m,
  '{error && (\n                    <div \n                      className="flex items-center gap-1.5 text-destructive animate-in fade-in slide-in-from-top-2 duration-200"\n                    >\n                      <AlertCircle size={14} />\n                      <span className="text-xs font-semibold uppercase tracking-wider">Code invalide</span>\n                    </div>\n                  )}'
);

fs.writeFileSync('src/components/dialogs/PinCodeDialog.tsx', content);
