const fs = require('fs');
let content = fs.readFileSync('src/components/VideoPlayer.tsx', 'utf8');

const regex1 = /<motion\.div\s+initial=\{\{\s*opacity:\s*0,\s*scale:\s*0\.95,\s*y:\s*-10\s*\}\}\s+animate=\{\{\s*opacity:\s*1,\s*scale:\s*1,\s*y:\s*0\s*\}\}\s+exit=\{\{\s*opacity:\s*0,\s*scale:\s*0\.95,\s*y:\s*-10\s*\}\}\s+transition=\{\{\s*duration:\s*0\.15\s*\}\}\s+className="absolute bottom-full right-0 mb-2 w-48 bg-card border border-border shadow-xl rounded-xl overflow-hidden py-1 z-50"/g;
content = content.replace(regex1, '<div className="absolute bottom-full right-0 mb-2 w-48 bg-card border border-border shadow-xl rounded-xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-150"');

const regex2 = /<motion\.div\s+initial=\{\{\s*opacity:\s*0,\s*scale:\s*0\.95,\s*y:\s*-10\s*\}\}\s+animate=\{\{\s*opacity:\s*1,\s*scale:\s*1,\s*y:\s*0\s*\}\}\s+exit=\{\{\s*opacity:\s*0,\s*scale:\s*0\.95,\s*y:\s*-10\s*\}\}\s+transition=\{\{\s*duration:\s*0\.15\s*\}\}\s+className="absolute bottom-full right-0 mb-2 w-64 bg-card border border-border shadow-xl rounded-xl overflow-hidden flex flex-col max-h-\[300px\] z-50"/g;
content = content.replace(regex2, '<div className="absolute bottom-full right-0 mb-2 w-64 bg-card border border-border shadow-xl rounded-xl overflow-hidden flex flex-col max-h-[300px] z-50 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-150"');

const regex3 = /<motion\.div\s+initial=\{\{\s*opacity:\s*0,\s*scale:\s*0\.95,\s*y:\s*-10\s*\}\}\s+animate=\{\{\s*opacity:\s*1,\s*scale:\s*1,\s*y:\s*0\s*\}\}\s+exit=\{\{\s*opacity:\s*0,\s*scale:\s*0\.95,\s*y:\s*-10\s*\}\}\s+transition=\{\{\s*duration:\s*0\.15\s*\}\}\s+className="absolute bottom-full right-0 mb-2 w-48 bg-card border border-border shadow-xl rounded-xl overflow-hidden flex flex-col z-50"/g;
content = content.replace(regex3, '<div className="absolute bottom-full right-0 mb-2 w-48 bg-card border border-border shadow-xl rounded-xl overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-150"');

content = content.replace(/<\/motion\.div>/g, '</div>');

fs.writeFileSync('src/components/VideoPlayer.tsx', content);
