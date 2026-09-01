#!/bin/bash

# We will modify App.tsx to use GlobalPlayerContext and react-router-dom

# 1. Add imports
sed -i '/import { addSession, WatchSession } from ".\/utils\/watchStats";/a \
import { Routes, Route, useLocation } from "react-router-dom";\
import { useGlobalPlayer } from "./context/GlobalPlayerContext";\
import { Settings } from "./pages/Settings";\
import { GlobalPlayer } from "./components/GlobalPlayer";\
' src/App.tsx

# 2. Remove states from App.tsx and get them from context
sed -i 's/const \[selectedChannel, setSelectedChannel\] = useState<IPTVChannel | null>(null);/const { selectedChannel, setSelectedChannel, isSplitView, setIsSplitView, splitChannels, setSplitChannels, activeSplitIndex, setActiveSplitIndex } = useGlobalPlayer();/g' src/App.tsx
sed -i '/const \[isSplitView, setIsSplitView\] = useState(false);/d' src/App.tsx
sed -i '/const \[splitChannels, setSplitChannels\] = useState<IPTVChannel\[\]>(\[\]);/d' src/App.tsx
sed -i '/const \[activeSplitIndex, setActiveSplitIndex\] = useState(0);/d' src/App.tsx

# 3. Add useLocation
sed -i '/const loadRequestIdRef = useRef(0);/a \
  const location = useLocation();\
' src/App.tsx

# 4. Modify the render part
# Replace the section's content with Routes and GlobalPlayer
