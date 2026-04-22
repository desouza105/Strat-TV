import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3500; // 3.5 seconds
    const intervalTime = 50;
    const totalSteps = duration / intervalTime;
    const increment = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500); // Small delay after hitting 100%
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
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-app-bg flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <img 
            src="https://image.noelshack.com/fichiers/2026/17/2/1776790858-1774711504-w-1920-quality-90-fit-scale-down.png" 
            alt="Strat TV Logo" 
            className="w-24 h-24 object-contain brightness-110"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Brand Name */}
        <div className="text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-normal text-app-text tracking-tighter"
          >
            Strat <span className="text-brand-secondary">TV</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-muted mt-2"
          >
            Le direct nouvelle génération
          </motion.p>
        </div>

        {/* Progress Container */}
        <div className="w-full space-y-4">
          <div className="h-1 w-full bg-app-border rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary shadow-[0_0_10px_rgba(173,1,185,0.5)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-app-text-muted uppercase">
            <span>Chargement</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Version Tag */}
      <div className="absolute bottom-12 left-0 w-full text-center">
        <span className="text-[10px] font-black text-app-border uppercase tracking-[0.5em]">
          Version 1.2.0
        </span>
      </div>
    </motion.div>
  );
}
