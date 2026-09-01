const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// The block to replace starts with: <AnimatePresence mode="wait">
// and ends with: </AnimatePresence> before </section>

const startIndex = content.indexOf('<AnimatePresence mode="wait">');
// Find the closing AnimatePresence before </section>
const sectionEndIndex = content.indexOf('</section>');
const endIndex = content.lastIndexOf('</AnimatePresence>', sectionEndIndex) + '</AnimatePresence>'.length;

const replacement = `
          <GlobalPlayer 
            playlistName={playlistName}
            error={error}
            sleepTimerActive={sleepTimerActive}
            sleepTimerRemaining={sleepTimerRemaining}
            formatRemaining={formatRemaining}
            cancelSleepTimer={cancelSleepTimer}
            startSleepTimer={startSleepTimer}
            handlePlayerError={handlePlayerError}
          />
          <Routes>
            <Route path="/" element={<div />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync('src/App.tsx', content);
