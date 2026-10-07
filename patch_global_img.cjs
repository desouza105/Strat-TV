const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalPlayer.tsx', 'utf8');

content = content.replace(
  '<img src={channel.logo} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />',
  '<img src={channel.logo} alt={channel.name} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />'
);

fs.writeFileSync('src/components/GlobalPlayer.tsx', content);
