const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<button\n                onClick={() => setIsLandscapeSidebarOpen(true)}\n               className="absolute top-4 left-4 z-40 p-2 bg-card/80 backdrop-blur-md rounded-xl border border-border shadow-lg md:hidden"\n               aria-label="Ouvrir la liste des chaînes"\n             >',
  '<button\n                onClick={() => setIsLandscapeSidebarOpen(true)}\n               className="absolute top-4 left-4 z-40 p-2 bg-card/80 backdrop-blur-md rounded-xl border border-border shadow-lg md:hidden"\n               aria-label="Ouvrir la liste des chaînes"\n             >'
); // It already has one.

fs.writeFileSync('src/App.tsx', content);
