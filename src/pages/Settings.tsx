import React from 'react';
import { useSettings, AppSettings } from '../context/SettingsContext';
import { Settings as SettingsIcon, MonitorPlay, Sliders, Zap, Paintbrush, Navigation, Cast, HardDrive, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export const Settings = () => {
  const { settings, updateSetting, resetSettings } = useSettings();

  const handleClearData = () => {
    if (window.confirm("Voulez-vous vraiment supprimer toutes les données locales ? Cette action est irréversible.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const Section = ({ title, icon: Icon, children }: any) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="text-primary" size={20} />
        <h2 className="text-lg font-bold uppercase tracking-wider">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ label, description, settingKey }: { label: string, description?: string, settingKey: keyof AppSettings }) => (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
      <div>
        <div className="font-semibold text-foreground">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
      </div>
      <button
        onClick={() => updateSetting(settingKey, !settings[settingKey] as any)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[settingKey] ? 'bg-primary' : 'bg-muted'}`}
        aria-label={label}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[settingKey] ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  const Select = ({ label, settingKey, options }: { label: string, settingKey: keyof AppSettings, options: { label: string, value: any }[] }) => (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
      <div className="font-semibold text-foreground">{label}</div>
      <select
        value={settings[settingKey] as string}
        onChange={(e) => updateSetting(settingKey, e.target.value as any)}
        className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
        aria-label={label}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="max-w-4xl w-full mx-auto p-4 md:p-8 space-y-8 pb-32"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase text-foreground">Paramètres</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Section title="Lecture" icon={MonitorPlay}>
            <Select label="Qualité vidéo" settingKey="videoQuality" options={[
              {label: "Auto", value: "Auto"}, {label: "1080p", value: "1080p"},
              {label: "720p", value: "720p"}, {label: "480p", value: "480p"}
            ]} />
            <Toggle label="Lecture automatique" settingKey="autoplay" />
            <Toggle label="Lecture en arrière-plan" settingKey="backgroundPlayback" />
            <Toggle label="Démarrer avec le son" settingKey="startWithSound" />
            <Toggle label="Sous-titres" settingKey="subtitlesEnabled" />
          </Section>

          <Section title="Player" icon={Sliders}>
            <Toggle label="Afficher les contrôles" settingKey="showControls" />
            <Toggle label="Mini-player automatique" description="Continuez à regarder votre chaîne pendant que vous naviguez." settingKey="autoMiniPlayer" />
            <Toggle label="Picture-in-Picture" settingKey="pipEnabled" />
            <Toggle label="Zapping rapide" settingKey="fastZapping" />
            <Toggle label="Mémoriser le volume" settingKey="rememberVolume" />
          </Section>

          <Section title="Qualité / Performance" icon={Zap}>
            <Toggle label="Qualité automatique" settingKey="autoQuality" />
            <Toggle label="Économie de données" settingKey="dataSaver" />
            <Toggle label="Préchargement" settingKey="preload" />
            <Select label="Buffer vidéo" settingKey="bufferSize" options={[
              {label: "Auto", value: "Auto"}, {label: "Faible", value: "Faible"}, {label: "Élevé", value: "Élevé"}
            ]} />
          </Section>
        </div>

        <div>
          <Section title="Apparence" icon={Paintbrush}>
            <Select label="Thème" settingKey="theme" options={[
              {label: "Système", value: "system"}, {label: "Clair", value: "light"}, {label: "Sombre", value: "dark"}
            ]} />
            <Toggle label="Animations" settingKey="animationsEnabled" />
            <Toggle label="Mode compact" settingKey="compactMode" />
          </Section>

          <Section title="Navigation" icon={Navigation}>
            <Select label="Sidebar" settingKey="sidebarMode" options={[
              {label: "Automatique", value: "auto"}, {label: "Toujours ouverte", value: "always_open"}
            ]} />
            <Toggle label="Raccourcis clavier" settingKey="keyboardShortcuts" />
          </Section>

          <Section title="Diffusion" icon={Cast}>
            <Toggle label="Chromecast auto" settingKey="chromecastAuto" />
            <Toggle label="AirPlay auto" settingKey="airplayAuto" />
            <Toggle label="Se souvenir de l'appareil" settingKey="rememberDevice" />
          </Section>

          <Section title="Données" icon={HardDrive}>
            <button onClick={handleClearData} className="w-full flex items-center justify-between p-4 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 rounded-xl transition-colors text-destructive">
              <span className="font-bold">Effacer les données locales</span>
              <AlertTriangle size={18} />
            </button>
          </Section>
        </div>
      </div>
    </motion.div>
  );
};
