const fs = require('fs');
let content = fs.readFileSync('src/components/dialogs/PinCodeDialog.tsx', 'utf8');

content = content.replace(
  '<Input \n                autoFocus\n                type="password"',
  '<Input \n                aria-label="Code PIN"\n                autoFocus\n                type="password"'
);

fs.writeFileSync('src/components/dialogs/PinCodeDialog.tsx', content);
