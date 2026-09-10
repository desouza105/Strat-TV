const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

// I need to clean up the bad replace
content = content.replace(
  '          <div className="hidden lg:flex items-center gap-3">\n            <Button\n              variant="outline"\n              variant={isSplitView ? "secondary" : "outline"}',
  '          <div className="hidden lg:flex items-center gap-3">\n            <Button\n              variant={isSplitView ? "secondary" : "outline"}'
);

content = content.replace(
  'import { Settings as SettingsIcon, Menu, Search, Loader2, Play, LayoutGrid, Flame, Grid2x2 } from "lucide-react";',
  'import { Menu, Search, Loader2, Play, LayoutGrid, Flame, Grid2x2 } from "lucide-react";'
);

fs.writeFileSync('src/components/Header.tsx', content);
