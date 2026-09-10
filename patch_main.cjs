const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');
content = content.replace('import { SettingsProvider } from \'./context/SettingsContext.tsx\';\n', '');
content = content.replace('    <SettingsProvider>\n', '');
content = content.replace('    </SettingsProvider>\n', '');
fs.writeFileSync('src/main.tsx', content);
