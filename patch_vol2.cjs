const fs = require('fs');

let content = fs.readFileSync('src/components/VideoPlayer.tsx', 'utf8');

// replace const { settings } = useSettings(); with const { settings, updateSetting } = useSettings();
content = content.replace('const { settings } = useSettings();', 'const { settings, updateSetting } = useSettings();');

// update handleVolumeChange
content = content.replace(
  '  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n    const value = parseFloat(e.target.value);\n    setVolume(value);',
  '  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n    const value = parseFloat(e.target.value);\n    setVolume(value);\n    if (settings.rememberVolume) updateSetting("lastVolume", value);'
);

// update toggleMute
content = content.replace(
  '  const toggleMute = () => {\n    if (videoRef.current) {\n      const newMuted = !videoRef.current.muted;\n      videoRef.current.muted = newMuted;\n      setIsMuted(newMuted);\n      if (!newMuted && volume === 0) {\n        setVolume(1);\n        videoRef.current.volume = 1;\n      }\n    }\n  };',
  '  const toggleMute = () => {\n    if (videoRef.current) {\n      const newMuted = !videoRef.current.muted;\n      videoRef.current.muted = newMuted;\n      setIsMuted(newMuted);\n      if (!newMuted && volume === 0) {\n        setVolume(1);\n        if (settings.rememberVolume) updateSetting("lastVolume", 1);\n        videoRef.current.volume = 1;\n      }\n    }\n  };'
);

fs.writeFileSync('src/components/VideoPlayer.tsx', content);
