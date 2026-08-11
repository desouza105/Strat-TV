const fs = require('fs');
const tsx = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Use babel or just regex if we can.
// Let's just find the first level of divs inside <header>
let headerStart = tsx.indexOf('<header');
let headerEnd = tsx.indexOf('</header>');
let headerContent = tsx.substring(headerStart, headerEnd);

let divCount = 0;
let level = 0;
let directChildren = [];
for (let i = 0; i < headerContent.length; i++) {
  if (headerContent.substr(i, 4) === '<div') {
    if (level === 0) {
      directChildren.push(headerContent.substr(i, 40));
    }
    level++;
  } else if (headerContent.substr(i, 6) === '</div') {
    level--;
  }
}
console.log("Direct children div count:", directChildren.length);
console.log(directChildren);
