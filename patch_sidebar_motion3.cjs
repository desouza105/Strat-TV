const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const regex = /<motion\.button\s+initial=\{\{\s*opacity:\s*0,\s*x:\s*-10\s*\}\}\s+animate=\{\{\s*opacity:\s*1,\s*x:\s*0\s*\}\}\s+transition=\{\{\s*delay:\s*Math\.min\(idx\s*\*\s*0\.02,\s*1\),\s*type:\s*"spring",\s*bounce:\s*0,\s*duration:\s*0\.4\s*\}\}/g;

content = content.replace(regex, '<button\n                      style={{ animationFillMode: "both", animationDelay: `${Math.min(idx * 20, 1000)}ms` }}\n                      className="animate-in fade-in slide-in-from-left-2 duration-300"');

content = content.replace(/<\/motion\.button>/g, '</button>');
fs.writeFileSync('src/components/Sidebar.tsx', content);
