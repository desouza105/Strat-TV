const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/bg-app-bg/g, 'bg-background');
  content = content.replace(/bg-app-card/g, 'bg-card');
  content = content.replace(/border-app-border/g, 'border-border');
  content = content.replace(/text-app-text-muted/g, 'text-muted-foreground');
  content = content.replace(/text-app-text/g, 'text-foreground');
  content = content.replace(/var\(--color-app-border\)/g, 'hsl(var(--border))');
  fs.writeFileSync(filePath, content, 'utf8');
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      replaceInFile(fullPath);
    }
  }
}

processDirectory('./src');
console.log('Done');
