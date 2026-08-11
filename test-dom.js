const fs = require('fs');
const code = fs.readFileSync('src/components/Header.tsx', 'utf8');

// A very naive matching to count direct children of <header>
let headerMatch = code.match(/<header[^>]*>([\s\S]*?)<\/header>/);
if (headerMatch) {
  let inner = headerMatch[1];
  console.log("Found header inner. Contains </div>:", inner.match(/<\/div>/g).length);
}
