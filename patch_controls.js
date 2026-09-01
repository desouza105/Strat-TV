const fs = require('fs');

let content = fs.readFileSync('src/components/VideoPlayer.tsx', 'utf8');
content = content.replace(
  '{/* Custom Controls */}\n      <div className="absolute bottom-0',
  '{/* Custom Controls */}\n      {!miniPlayer && settings.showControls && (\n      <div className="absolute bottom-0'
);

content = content.replace(
  '              <button \n                onClick={toggleFullscreen}',
  '            </div>\n          </div>\n        </div>\n      </div>\n      )}\n      <button \n                onClick={toggleFullscreen}' // Wait, that's brittle.
);

fs.writeFileSync('src/components/VideoPlayer.tsx', content);
