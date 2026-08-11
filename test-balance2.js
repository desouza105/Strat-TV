import fs from 'fs';
const content = fs.readFileSync('src/components/Header.tsx', 'utf8');
let divCount = 0;
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  // find all <div ...> that don't end with />
  const line = lines[i];
  let m1 = (line.match(/<div(?![^>]*\/>)/g) || []).length;
  // find all </div>
  let m2 = (line.match(/<\/div>/g) || []).length;
  divCount += m1 - m2;
}
console.log("Final div count:", divCount);
