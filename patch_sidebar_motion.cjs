const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Remove motion and AnimatePresence imports
content = content.replace(
  'import { motion, AnimatePresence } from \'motion/react\';\n',
  ''
);

// Remove AnimatePresence wrap
content = content.replace(
  /<AnimatePresence>\s*\{filteredChannels\.map/gm,
  '{filteredChannels.map'
);

content = content.replace(
  /<\/AnimatePresence>/g,
  ''
);

// Replace motion.button
content = content.replace(
  /<motion\.button\s*initial=\{\{ opacity: 0, x: -10 \}\}\s*animate=\{\{ opacity: 1, x: 0 \}\}\s*transition=\{\{ delay: Math\.min\(idx \* 0\.02, 1\), type: "spring", bounce: 0, duration: 0\.4 \}\}\s*key=\{channel\.id \+ idx\}\s*id=\{\`channel-btn-\$\{idx\}\`\}\s*onClick=\{\(\) => onChannelSelect\(channel\)\}\s*className=\{cn\("flex items-center gap-3 p-2 rounded-xl transition-all text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary", isSelected \? "bg-primary\/10 ring-1 ring-primary\/30" : "hover:bg-muted"\)\}\s*>/gm,
  '<button\n                      key={channel.id + idx}\n                      id={`channel-btn-${idx}`}\n                      onClick={() => onChannelSelect(channel)}\n                      className={cn("flex items-center gap-3 p-2 rounded-xl transition-all text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary animate-in fade-in slide-in-from-left-2 duration-300", isSelected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted")}\n                      style={{ animationFillMode: "both", animationDelay: `${Math.min(idx * 20, 1000)}ms` }}\n                    >'
);

content = content.replace(/<\/motion\.button>/g, '</button>');

fs.writeFileSync('src/components/Sidebar.tsx', content);
