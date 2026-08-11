import fs from 'fs';
const content = fs.readFileSync('src/components/Header.tsx', 'utf8');
let divCount = 0;
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  let open = (lines[i].match(/<div/g) || []).length;
  let close = (lines[i].match(/<\/div>/g) || []).length;
  divCount += open - close;
  if (divCount < 0) {
    console.log("Negative div count at line", i + 1);
  }
}
console.log("Final div count:", divCount);
