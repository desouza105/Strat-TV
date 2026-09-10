const fs = require('fs');
let content = fs.readFileSync('src/components/VideoPlayer.tsx', 'utf8');

content = content.replace(/<motion\.div[^>]*className="([^"]+)"[^>]*>/g, (match, className) => {
  return `<div className="${className} animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-150">`;
});

content = content.replace(/<\/motion\.div>/g, '</div>');

fs.writeFileSync('src/components/VideoPlayer.tsx', content);
