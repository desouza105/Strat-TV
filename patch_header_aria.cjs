const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

content = content.replace(
  '<Button variant={isSplitView ? "secondary" : "ghost"} size="icon" onClick={onToggleSplitView} className="h-10 w-10 shrink-0 rounded-xl">',
  '<Button aria-label="Toggle split view" variant={isSplitView ? "secondary" : "ghost"} size="icon" onClick={onToggleSplitView} className="h-10 w-10 shrink-0 rounded-xl">'
);

content = content.replace(
  '<Button variant={isPortalOpen ? "secondary" : "ghost"} size="icon" onClick={() => setIsPortalOpen(!isPortalOpen)} className="h-10 w-10 shrink-0 rounded-xl">',
  '<Button aria-label="Open portal menu" aria-expanded={isPortalOpen} variant={isPortalOpen ? "secondary" : "ghost"} size="icon" onClick={() => setIsPortalOpen(!isPortalOpen)} className="h-10 w-10 shrink-0 rounded-xl">'
);

content = content.replace(
  '<Button variant={isAfricaActive ? "secondary" : "ghost"} size="icon" onClick={() => onLoadPlaylist(africaUrl)} disabled={isLoading} className="h-10 w-10 shrink-0 rounded-xl">',
  '<Button aria-label="Load Africa TV playlist" variant={isAfricaActive ? "secondary" : "ghost"} size="icon" onClick={() => onLoadPlaylist(africaUrl)} disabled={isLoading} className="h-10 w-10 shrink-0 rounded-xl">'
);

content = content.replace(
  '<Button variant={isEuropaActive ? "secondary" : "ghost"} size="icon" onClick={() => onLoadPlaylist(europaUrl)} disabled={isLoading} className="h-10 w-10 shrink-0 rounded-xl">',
  '<Button aria-label="Load Europa TV playlist" variant={isEuropaActive ? "secondary" : "ghost"} size="icon" onClick={() => onLoadPlaylist(europaUrl)} disabled={isLoading} className="h-10 w-10 shrink-0 rounded-xl">'
);

content = content.replace(
  '<Button variant={isWorldActive ? "secondary" : "ghost"} size="icon" onClick={() => onLoadPlaylist(worldUrl)} disabled={isLoading} className="h-10 w-10 shrink-0 rounded-xl">',
  '<Button aria-label="Load World TV playlist" variant={isWorldActive ? "secondary" : "ghost"} size="icon" onClick={() => onLoadPlaylist(worldUrl)} disabled={isLoading} className="h-10 w-10 shrink-0 rounded-xl">'
);

content = content.replace(
  '<Button variant={isRegionalActive ? "secondary" : "ghost"} size="icon" onClick={() => onLoadPlaylist(regionalUrl)} disabled={isLoading} className="h-10 w-10 shrink-0 rounded-xl">',
  '<Button aria-label="Load Regional TV playlist" variant={isRegionalActive ? "secondary" : "ghost"} size="icon" onClick={() => onLoadPlaylist(regionalUrl)} disabled={isLoading} className="h-10 w-10 shrink-0 rounded-xl">'
);

content = content.replace(
  /<Button variant=\{isAdultActive \? "destructive" : "ghost"\} size="icon" onClick=\{\(\) => setIsPasscodeOpen\(true\)\} disabled=\{isLoading\} className=\{cn\("h-10 w-10 shrink-0 rounded-xl", !isAdultActive && "hover:bg-destructive\/10 hover:text-destructive"\)\}>/g,
  '<Button aria-label="Open adult playlist" variant={isAdultActive ? "destructive" : "ghost"} size="icon" onClick={() => setIsPasscodeOpen(true)} disabled={isLoading} className={cn("h-10 w-10 shrink-0 rounded-xl", !isAdultActive && "hover:bg-destructive/10 hover:text-destructive")}>'
);

content = content.replace(
  '<Button variant="ghost" size="icon" onClick={() => setIsImportOpen(true)} className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground">',
  '<Button aria-label="Import custom playlist" variant="ghost" size="icon" onClick={() => setIsImportOpen(true)} className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground">'
);

content = content.replace(
  '<Button variant="ghost" size="icon" onClick={() => setIsHighContrast(!isHighContrast)} className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground">',
  '<Button aria-label="Toggle high contrast" variant="ghost" size="icon" onClick={() => setIsHighContrast(!isHighContrast)} className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground">'
);

content = content.replace(
  '<Button variant="ghost" size="icon" onClick={() => { if(onOpenStats) onOpenStats(); }} className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground">',
  '<Button aria-label="Open statistics" variant="ghost" size="icon" onClick={() => { if(onOpenStats) onOpenStats(); }} className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-foreground">'
);

fs.writeFileSync('src/components/Header.tsx', content);
