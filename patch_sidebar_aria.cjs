const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

content = content.replace(
  '<button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors">',
  '<button aria-label="Close sidebar" onClick={onClose} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors">'
);

content = content.replace(
  '<Button variant={showOnlyWorking ? "secondary" : "ghost"} size="icon" onClick={() => setShowOnlyWorking(!showOnlyWorking)} className={cn("h-9 w-9 rounded-lg transition-all", showOnlyWorking ? "text-primary" : "text-muted-foreground hover:text-foreground")} title={showOnlyWorking ? "Afficher toutes les chaînes" : "Masquer les chaînes H.S"}>',
  '<Button aria-label={showOnlyWorking ? "Afficher toutes les chaînes" : "Masquer les chaînes H.S"} variant={showOnlyWorking ? "secondary" : "ghost"} size="icon" onClick={() => setShowOnlyWorking(!showOnlyWorking)} className={cn("h-9 w-9 rounded-lg transition-all", showOnlyWorking ? "text-primary" : "text-muted-foreground hover:text-foreground")} title={showOnlyWorking ? "Afficher toutes les chaînes" : "Masquer les chaînes H.S"}>'
);

content = content.replace(
  /className=\{cn\("animate-in fade-in slide-in-from-left-2 duration-300 flex items-center gap-3 p-2 rounded-xl transition-all text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary",/g,
  'aria-label={`Sélectionner la chaîne ${channel.name}`} className={cn("animate-in fade-in slide-in-from-left-2 duration-300 flex items-center gap-3 p-2 rounded-xl transition-all text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary",'
);

fs.writeFileSync('src/components/Sidebar.tsx', content);
