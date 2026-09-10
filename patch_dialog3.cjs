const fs = require('fs');
let content = fs.readFileSync('src/components/dialogs/PinCodeDialog.tsx', 'utf8');

const targetStr = `              <div className="h-5 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-1.5 text-destructive"
                    >
                      <AlertCircle size={14} />
                      <span className="text-xs font-semibold uppercase tracking-wider">Code invalide</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>`;

const replacementStr = `              <div className="h-5 flex items-center justify-center">
                  {error && (
                    <div 
                      className="flex items-center gap-1.5 text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
                    >
                      <AlertCircle size={14} />
                      <span className="text-xs font-semibold uppercase tracking-wider">Code invalide</span>
                    </div>
                  )}
              </div>`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/dialogs/PinCodeDialog.tsx', content);
