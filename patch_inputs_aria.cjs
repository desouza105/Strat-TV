const fs = require('fs');

let header = fs.readFileSync('src/components/Header.tsx', 'utf8');
header = header.replace(
  '<input\n                    autoFocus\n                    type="text"',
  '<input\n                    autoFocus\n                    aria-label="Rechercher"\n                    type="text"'
);
fs.writeFileSync('src/components/Header.tsx', header);

let video = fs.readFileSync('src/components/VideoPlayer.tsx', 'utf8');
video = video.replace(
  '<input\n                  type="range"\n                  min="0"\n                  max="1"',
  '<input\n                  aria-label="Volume"\n                  type="range"\n                  min="0"\n                  max="1"'
);
fs.writeFileSync('src/components/VideoPlayer.tsx', video);
