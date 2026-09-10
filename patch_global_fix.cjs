const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalPlayer.tsx', 'utf8');

// The return statement issue
content = content.replace(
  '  return (\n          {isSplitView ? (',
  '  return (\n    <>\n      {isSplitView ? ('
);

content = content.replace(
  '      ) : null}\n    \n  );',
  '      ) : null}\n    </>\n  );'
);

fs.writeFileSync('src/components/GlobalPlayer.tsx', content);
