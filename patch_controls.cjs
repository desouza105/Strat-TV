const fs = require('fs');

let content = fs.readFileSync('src/components/VideoPlayer.tsx', 'utf8');

const targetStr = '{/* Custom Controls */}\n      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">';
const replacementStr = '{/* Custom Controls */}\n      {!miniPlayer && settings.showControls && (\n      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">';

content = content.replace(targetStr, replacementStr);

const endTargetStr = '              <button \n                onClick={toggleFullscreen}';
const endReplacementStr = '            </div>\n          </div>\n        </div>\n      </div>\n      )}\n              <button \n                onClick={toggleFullscreen}';

// Since the closing tags are: 
//               <button onClick={toggleFullscreen} ...
// We need to find the correct place to close `{!miniPlayer && settings.showControls && (`

content = content.replace(
  '              <button \n                onClick={toggleFullscreen}\n                className="p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors text-foreground"\n                aria-label="Basculer le plein écran"\n              >\n                <Maximize className="w-6 h-6" />\n              </button>\n            </div>\n          </div>\n        </div>\n      </div>',
  '              <button \n                onClick={toggleFullscreen}\n                className="p-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 hover:bg-white/20 rounded-full transition-colors text-foreground"\n                aria-label="Basculer le plein écran"\n              >\n                <Maximize className="w-6 h-6" />\n              </button>\n            </div>\n          </div>\n        </div>\n      </div>\n      )}'
);

fs.writeFileSync('src/components/VideoPlayer.tsx', content);
