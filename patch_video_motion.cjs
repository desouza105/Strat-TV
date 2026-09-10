const fs = require('fs');
let content = fs.readFileSync('src/components/VideoPlayer.tsx', 'utf8');

content = content.replace(
  'import { motion, AnimatePresence } from \'motion/react\';\n',
  ''
);

content = content.replace(/<AnimatePresence>/g, '');
content = content.replace(/<\/AnimatePresence>/g, '');

content = content.replace(
  /<motion\.div\s*initial=\{\{ opacity: 0, scale: 0\.95, y: -10 \}\}\s*animate=\{\{ opacity: 1, scale: 1, y: 0 \}\}\s*exit=\{\{ opacity: 0, scale: 0\.95, y: -10 \}\}\s*transition=\{\{ duration: 0\.15 \}\}\s*className="absolute bottom-full right-0 mb-2 w-48 bg-card border border-border shadow-xl rounded-xl overflow-hidden py-1 z-50"/g,
  '<div className="absolute bottom-full right-0 mb-2 w-48 bg-card border border-border shadow-xl rounded-xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-150"'
);

content = content.replace(
  /<motion\.div\s*initial=\{\{ opacity: 0, scale: 0\.95, y: -10 \}\}\s*animate=\{\{ opacity: 1, scale: 1, y: 0 \}\}\s*exit=\{\{ opacity: 0, scale: 0\.95, y: -10 \}\}\s*transition=\{\{ duration: 0\.15 \}\}\s*className="absolute bottom-full right-0 mb-2 w-64 bg-card border border-border shadow-xl rounded-xl overflow-hidden flex flex-col max-h-\[300px\] z-50"/g,
  '<div className="absolute bottom-full right-0 mb-2 w-64 bg-card border border-border shadow-xl rounded-xl overflow-hidden flex flex-col max-h-[300px] z-50 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-150"'
);

content = content.replace(
  /<motion\.div\s*initial=\{\{ opacity: 0, scale: 0\.95, y: -10 \}\}\s*animate=\{\{ opacity: 1, scale: 1, y: 0 \}\}\s*exit=\{\{ opacity: 0, scale: 0\.95, y: -10 \}\}\s*transition=\{\{ duration: 0\.15 \}\}\s*className="absolute bottom-full right-0 mb-2 w-48 bg-card border border-border shadow-xl rounded-xl overflow-hidden flex flex-col z-50"/g,
  '<div className="absolute bottom-full right-0 mb-2 w-48 bg-card border border-border shadow-xl rounded-xl overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-150"'
);

content = content.replace(/<\/motion\.div>/g, '</div>');

fs.writeFileSync('src/components/VideoPlayer.tsx', content);
