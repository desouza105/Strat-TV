import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# Replace all occurrences where `isFilmsView` conditions would resolve to `false`
# Wait, actually `!isFilmsView` is always true now because we removed films view!
# So `!isFilmsView ? A : B` -> `A`
# `isFilmsView ? A : B` -> `B`

# Let's remove the imports first
content = content.replace("import { useNavigate, useLocation } from 'react-router-dom';\n", '')
content = content.replace("const navigate = useNavigate();\n", '')
content = content.replace("const location = useLocation();\n", '')
content = content.replace("const isFilmsView = location.pathname.startsWith('/films');\n", '')

# Let's just remove the buttons entirely.
content = re.sub(r'<div className="flex items-center bg-black/40 backdrop-blur-md rounded-xl p-1 mr-2 border border-border">.*?</div>', '', content, flags=re.DOTALL)
content = re.sub(r'<div className="flex items-center bg-black/40 backdrop-blur-md rounded-xl p-1 mb-4 border border-border">.*?</div>', '', content, flags=re.DOTALL)

# And remove `{!isFilmsView && (` and `)}` wrappers around the remaining content
content = content.replace('{!isFilmsView && (', '')
# For the `)}`, we can find the matching `)}` visually, but it's easier to just do:
content = content.replace('              </>\n            )}', '              </>')
content = content.replace('                </>\n              )}', '                </>')
content = content.replace('            )}', '')
content = content.replace('              )}', '')
content = content.replace('Film, ', '')

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)

