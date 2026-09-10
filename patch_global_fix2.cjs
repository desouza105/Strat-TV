const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalPlayer.tsx', 'utf8');

// Find: return ( \n {isSplitView ?
content = content.replace(
  /return\s*\(\s*\{isSplitView \?/g,
  'return (\n    <>\n      {isSplitView ?'
);

content = content.replace(
  /\)\s*:\s*null\}\s*\)\;/g,
  ') : null}\n    </>\n  );'
);

fs.writeFileSync('src/components/GlobalPlayer.tsx', content);
