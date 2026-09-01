const fs = require('fs');
let content = fs.readFileSync('src/components/VideoPlayer.tsx', 'utf8');

const targetStr = '      <video\n        ref={videoRef}';
const replacementStr = '      {castState === "connected" && (\n        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-6 text-center">\n          <Cast className="w-16 h-16 text-primary mb-4 animate-pulse" />\n          <h3 className="text-xl font-bold text-foreground mb-2">Diffusion active</h3>\n          <p className="text-muted-foreground max-w-md">La vidéo est en cours de lecture sur un autre écran.</p>\n        </div>\n      )}\n      <video\n        ref={videoRef}';

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/VideoPlayer.tsx', content);
