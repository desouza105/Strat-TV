const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

content = content.replace(
  'import App from \'./App.tsx\';',
  'import App from \'./App.tsx\';\nimport { ThemeProvider } from \'./providers/ThemeProvider.tsx\';'
);

content = content.replace(
  'document.documentElement.classList.add(\'dark\');\n',
  ''
);

content = content.replace(
  '    <GlobalPlayerProvider>\n        <App />\n      </GlobalPlayerProvider>',
  '    <ThemeProvider defaultTheme="dark">\n        <GlobalPlayerProvider>\n          <App />\n        </GlobalPlayerProvider>\n      </ThemeProvider>'
);

fs.writeFileSync('src/main.tsx', content);
