const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

content = content.replace('import { BrowserRouter } from \'react-router-dom\';\n', '');
content = content.replace('        <BrowserRouter>\n          <App />\n        </BrowserRouter>', '        <App />');

fs.writeFileSync('src/main.tsx', content);
