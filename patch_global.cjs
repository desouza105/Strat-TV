const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalPlayer.tsx', 'utf8');
content = content.replace(
  'import { useSettings } from \'../context/SettingsContext\';',
  ''
);

content = content.replace(
  '  const { settings } = useSettings();\n',
  ''
);

content = content.replace(
  /  useEffect\(\(\) => \{\n    if \(\(selectedChannel \|\| isSplitView\) && settings\.autoMiniPlayer\) \{\n      if \(location\.pathname !== '\/'\) \{\n        setIsMiniPlayer\(true\);\n      \} else \{\n        setIsMiniPlayer\(false\);\n      \}\n    \}\n  \}, \[location\.pathname, selectedChannel, isSplitView, settings\.autoMiniPlayer, setIsMiniPlayer\]\);\n/,
  ''
);

fs.writeFileSync('src/components/GlobalPlayer.tsx', content);
