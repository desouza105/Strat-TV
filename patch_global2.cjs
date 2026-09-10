const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalPlayer.tsx', 'utf8');

content = content.replace(
  'import { useLocation, useNavigate } from \'react-router-dom\';\n',
  ''
);

content = content.replace(
  '  const location = useLocation();\n  const navigate = useNavigate();\n',
  ''
);

content = content.replace(
  '    if (location.pathname === \'/\') {\n      return (\n        <motion.div',
  '    return (\n      <motion.div'
);

content = content.replace(
  '        </motion.div>\n      );\n    }\n    return null;\n  }',
  '      </motion.div>\n    );\n  }'
);

content = content.replace(
  '                 <button onClick={(e) => { e.stopPropagation(); setIsMiniPlayer(false); navigate(\'/\'); }} className="p-1.5 bg-black/50 hover:bg-white/20 rounded-lg transition-colors text-white">',
  '                 <button onClick={(e) => { e.stopPropagation(); setIsMiniPlayer(false); }} className="p-1.5 bg-black/50 hover:bg-white/20 rounded-lg transition-colors text-white">'
);

fs.writeFileSync('src/components/GlobalPlayer.tsx', content);
