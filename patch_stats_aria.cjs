const fs = require('fs');
let content = fs.readFileSync('src/components/StatsModal.tsx', 'utf8');

content = content.replace(
  '<Button variant="ghost" size="icon" onClick={handleClear} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Effacer l\'historique">',
  '<Button aria-label="Effacer l\'historique" variant="ghost" size="icon" onClick={handleClear} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Effacer l\'historique">'
);

fs.writeFileSync('src/components/StatsModal.tsx', content);
