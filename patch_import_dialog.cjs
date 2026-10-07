const fs = require('fs');
let content = fs.readFileSync('src/components/dialogs/ImportPlaylistDialog.tsx', 'utf8');

content = content.replace(
  '<Input \n                    type="text" \n                    placeholder="Nom de la playlist (optionnel)"',
  '<Input \n                    aria-label="Nom de la playlist"\n                    type="text" \n                    placeholder="Nom de la playlist (optionnel)"'
);

content = content.replace(
  '<Input \n                    type="url" \n                    placeholder="https://exemple.com/playlist.m3u"',
  '<Input \n                    aria-label="URL de la playlist"\n                    type="url" \n                    placeholder="https://exemple.com/playlist.m3u"'
);

content = content.replace(
  '<input type="file" accept=".m3u,.m3u8" className="hidden" onChange={handleFileImport} />',
  '<input aria-label="Fichier playlist" type="file" accept=".m3u,.m3u8" className="hidden" onChange={handleFileImport} />'
);

fs.writeFileSync('src/components/dialogs/ImportPlaylistDialog.tsx', content);
