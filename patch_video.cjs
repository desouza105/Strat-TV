const fs = require('fs');
let content = fs.readFileSync('src/components/VideoPlayer.tsx', 'utf8');

content = content.replace(
  'import { useSettings } from "../context/SettingsContext";\n',
  ''
);

content = content.replace(
  '  const { settings, updateSetting } = useSettings();\n',
  ''
);

content = content.replace(
  'const [isMuted, setIsMuted] = useState(!settings.startWithSound);',
  'const [isMuted, setIsMuted] = useState(false);'
);

content = content.replace(
  'const [volume, setVolume] = useState(settings.rememberVolume ? settings.lastVolume : 1);',
  'const [volume, setVolume] = useState(1);'
);

content = content.replace(/if \(settings\.autoplay\) safePlay\(\);/g, 'safePlay();');
content = content.replace(/if \(settings\.rememberVolume\) updateSetting\("lastVolume", value\);/g, '');
content = content.replace(/if \(settings\.rememberVolume\) updateSetting\("lastVolume", 1\);/g, '');
content = content.replace(/\{!miniPlayer && settings\.showControls && \(/g, '{!miniPlayer && (');
content = content.replace(/\{isPipAvailable && settings\.pipEnabled && \(/g, '{isPipAvailable && (');

fs.writeFileSync('src/components/VideoPlayer.tsx', content);
