const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalPlayer.tsx', 'utf8');

// Remove motion and AnimatePresence imports
content = content.replace(
  'import { motion, AnimatePresence } from \'motion/react\';\n',
  ''
);

// Replace motion.div with normal div and Tailwind classes
content = content.replace(
  /<motion\.div\s*initial=\{\{ opacity: 0, y: 20 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*transition=\{\{ type: "spring", bounce: 0, duration: 0\.6 \}\}\s*className="text-center max-w-md z-10"\s*>/gm,
  '<div className="text-center max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">'
);
content = content.replace(/<\/motion\.div>/g, '</div>');

content = content.replace(
  /<motion\.div\s*initial=\{\{ opacity: 0, y: 50, scale: 0\.9 \}\}\s*animate=\{\{ opacity: 1, y: 0, scale: 1 \}\}\s*exit=\{\{ opacity: 0, y: 50, scale: 0\.9 \}\}\s*className="fixed bottom-20 right-4 md:bottom-4 md:right-4 w-\[320px\] rounded-xl overflow-hidden shadow-2xl z-50 bg-black border border-border"\s*style=\{\{ aspectRatio: '16\/9' \}\}\s*>/gm,
  '<div className="fixed bottom-20 right-4 md:bottom-4 md:right-4 w-[320px] rounded-xl overflow-hidden shadow-2xl z-50 bg-black border border-border animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-300" style={{ aspectRatio: "16/9" }}>'
);

content = content.replace(
  /<AnimatePresence mode="wait">/g,
  ''
);
content = content.replace(
  /<\/AnimatePresence>/g,
  ''
);

content = content.replace(
  /<motion\.div\s*key="split-view"\s*initial=\{\{ opacity: 0, scale: 0\.98 \}\}\s*animate=\{\{ opacity: 1, scale: 1 \}\}\s*exit=\{\{ opacity: 0, scale: 0\.98 \}\}\s*transition=\{\{ type: "spring", bounce: 0, duration: 0\.5 \}\}\s*className=/gm,
  '<div className='
);

// Because we replaced className= we need to append the animate class inside the matched string. Wait, I'll use a regex for the classname of split-view:
content = content.replace(
  /<div className=\{cn\("grid gap-6 w-full max-w-7xl z-10"/g,
  '<div className={cn("grid gap-6 w-full max-w-7xl z-10 animate-in fade-in zoom-in-[0.98] duration-500"'
);

content = content.replace(
  /<motion\.div\s*key=\{selectedChannel\.url\}\s*initial=\{\{ opacity: 0, scale: 0\.98 \}\}\s*animate=\{\{ opacity: 1, scale: 1 \}\}\s*exit=\{\{ opacity: 0, scale: 0\.98 \}\}\s*transition=\{\{ type: "spring", bounce: 0, duration: 0\.5 \}\}\s*className="w-full max-w-6xl z-10"\s*>/gm,
  '<div key={selectedChannel.url} className="w-full max-w-6xl z-10 animate-in fade-in zoom-in-[0.98] duration-500">'
);

content = content.replace(
  /<AnimatePresence>\s*\{sleepTimerActive \? \(\s*<motion\.div\s*initial=\{\{ opacity: 0, y: -10 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*exit=\{\{ opacity: 0, y: -10 \}\}\s*className="w-full max-w-6xl z-20 mb-3 flex items-center justify-between bg-background\/80 backdrop-blur-sm border border-border rounded-2xl px-4 py-3 shadow-sm"\s*>/gm,
  '{sleepTimerActive ? (\n              <div className="w-full max-w-6xl z-20 mb-3 flex items-center justify-between bg-background/80 backdrop-blur-sm border border-border rounded-2xl px-4 py-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">'
);

fs.writeFileSync('src/components/GlobalPlayer.tsx', content);
