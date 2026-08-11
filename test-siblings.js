import fs from 'fs';
const content = fs.readFileSync('src/components/Header.tsx', 'utf8');

// A very simple regex to find <button> and <span> that are close to each other.
// Just print lines that have both, or search the file manually.
