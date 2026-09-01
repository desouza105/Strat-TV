const fs = require('fs');

let content = fs.readFileSync('src/components/VideoPlayer.tsx', 'utf8');
content = content.replace(
  '  useEffect(() => {',
  '  useEffect(() => {\n    if (videoRef.current) {\n      videoRef.current.volume = volume;\n    }\n  }, [volume]);\n\n  useEffect(() => {'
);
fs.writeFileSync('src/components/VideoPlayer.tsx', content);
