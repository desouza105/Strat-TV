const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetStr = `                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 1), type: "spring", bounce: 0, duration: 0.4 }}
                      key={channel.id + idx}
                      id={\`channel-btn-\${idx}\`}
                      onClick={() => onChannelSelect(channel)}
                      className={cn("flex items-center gap-3 p-2 rounded-xl transition-all text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary", isSelected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted")}
                    >`;

const replacementStr = `                    <button
                      key={channel.id + idx}
                      id={\`channel-btn-\${idx}\`}
                      onClick={() => onChannelSelect(channel)}
                      className={cn("flex items-center gap-3 p-2 rounded-xl transition-all text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary animate-in fade-in slide-in-from-left-2 duration-300", isSelected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted")}
                      style={{ animationFillMode: "both", animationDelay: \`\${Math.min(idx * 20, 1000)}ms\` }}
                    >`;

content = content.replace(targetStr, replacementStr);
content = content.replace(/<\/motion\.button>/g, '</button>');
fs.writeFileSync('src/components/Sidebar.tsx', content);
