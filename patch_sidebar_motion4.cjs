const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

content = content.replace(
  '                      className="animate-in fade-in slide-in-from-left-2 duration-300"\n                      key={channel.id + idx}\n                      id={`channel-btn-${idx}`}\n                      tabIndex={focusedIndex === idx ? 0 : -1}\n                      onFocus={() => setFocusedIndex(idx)}\n                      onClick={() => onChannelSelect(channel)}\n                      className={cn("flex items-center gap-3 p-2 rounded-xl transition-all text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary",',
  '                      key={channel.id + idx}\n                      id={`channel-btn-${idx}`}\n                      tabIndex={focusedIndex === idx ? 0 : -1}\n                      onFocus={() => setFocusedIndex(idx)}\n                      onClick={() => onChannelSelect(channel)}\n                      className={cn("animate-in fade-in slide-in-from-left-2 duration-300 flex items-center gap-3 p-2 rounded-xl transition-all text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary",'
);

fs.writeFileSync('src/components/Sidebar.tsx', content);
