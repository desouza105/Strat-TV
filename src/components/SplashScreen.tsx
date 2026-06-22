import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'complete'>('loading');

  useEffect(() => {
    const duration = 2500; // 2.5 seconds to feel snappy but smooth
    const intervalTime = 30;
    const totalSteps = duration / intervalTime;
    const increment = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setPhase('complete');
          setTimeout(() => {
            onComplete();
          }, 800);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full max-w-sm px-8">
        
        {/* Animated Brand Container */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
           className="flex flex-col items-center w-full"
        >
          {/* Icon Box */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 mb-8 group">
            <motion.div 
              initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
            >
              <img 
                src="https://image.noelshack.com/fichiers/2026/22/3/1779866809-groupe-3.png" 
                alt="Moody Icon" 
                className="w-full h-full object-contain relative z-10"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
          
          {/* Typographic Title */}
          <div className="overflow-hidden mb-3">
            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-6xl font-normal tracking-tighter text-white flex items-baseline justify-center"
            >
              Moody<span className="font-serif italic text-white/40 ml-1 font-normal tracking-tight">.</span>
            </motion.h1>
          </div>
          
          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex items-center gap-3 mb-16"
          >
            <div className="w-8 h-[1px] bg-white/20" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
              Expérience Premium
            </p>
            <div className="w-8 h-[1px] bg-white/20" />
          </motion.div>
        </motion.div>

        {/* Loading Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: phase === 'complete' ? 0 : 1, y: phase === 'complete' ? -10 : 0 }}
          transition={{ duration: 0.5, delay: phase === 'loading' ? 0.8 : 0 }}
          className="w-full max-w-[240px] flex flex-col items-center gap-6"
        >
          <div className="w-full h-[1px] bg-white/10 relative overflow-hidden">
             <motion.div 
               className="absolute top-0 left-0 h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
               style={{ width: `${progress}%` }}
               transition={{ ease: "linear" }}
             />
          </div>
          
          <div className="flex justify-between w-full items-center">
            <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">
              {progress < 30 ? 'Connexion' : progress < 70 ? 'Chargement' : 'Initialisation'}
            </span>
            <span className="text-[10px] font-black tracking-widest text-white font-mono opacity-80">
              {Math.round(progress)}%
            </span>
          </div>
        </motion.div>
      </div>

      {/* Decorative UI elements */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 1 }}
        className="absolute top-8 left-8 md:top-12 md:left-12 flex flex-col gap-1"
      >
        <div className="w-1 h-1 bg-white/40 rounded-full" />
        <div className="w-1 h-1 bg-white/20 rounded-full" />
        <div className="w-1 h-1 bg-white/10 rounded-full" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 1 }}
        className="absolute bottom-8 right-8 md:bottom-12 md:right-12 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] font-mono"
      >
        SYS.v1.2
      </motion.div>
    </motion.div>
  );
}
