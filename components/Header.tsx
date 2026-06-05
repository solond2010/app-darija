"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { Flame, Star, HelpCircle, Volume2, VolumeX } from "lucide-react";

// Pops with a spring whenever its numeric value changes (key change → remount).
function PopNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.45 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 14 }}
      className="inline-block"
    >
      {value}
    </motion.span>
  );
}
import { NumberGuide } from "./NumberGuide";
import { ThemeToggle } from "./ThemeToggle";

export const Header: React.FC = () => {
  const { streak, xp, soundsEnabled, toggleSounds, isHydrated } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isHydrated) {
    return (
      <header className="sticky top-0 h-14 bg-white/90 border-b-2 border-brand-beige flex items-center justify-between px-4 z-40 max-w-md mx-auto w-full">
        <div className="w-16 h-5 skeleton rounded-lg" />
        <div className="w-24 h-5 skeleton rounded-lg" />
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 h-14 glass border-b border-white/40 flex items-center justify-between px-4 z-40 max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-saffron via-brand-coral to-brand-rose flex items-center justify-center glow-coral">
            <span className="text-base leading-none">🐱</span>
          </div>
          <span className="font-extrabold text-lg font-title text-gradient tracking-tight">
            Meshi
          </span>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-1.5">
          {/* Streak */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold font-title ${
            streak > 0 ? "bg-orange-50 text-orange-500" : "bg-slate-50 text-slate-400"
          }`}>
            <Flame className={`w-3.5 h-3.5 ${streak > 0 ? "fill-orange-400 text-orange-400" : ""}`} />
            <PopNumber value={streak} />
          </div>

          {/* XP */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold font-title ${
            xp > 0 ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-400"
          }`}>
            <Star className={`w-3.5 h-3.5 ${xp > 0 ? "fill-amber-400 text-amber-400" : ""}`} />
            <PopNumber value={xp} />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0.5 pl-1 border-l-2 border-brand-beige ml-0.5">
            <button
              onClick={toggleSounds}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-coral hover:bg-brand-coral/10 transition-colors"
              title={soundsEnabled ? "Silenciar" : "Activar sonido"}
            >
              {soundsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-coral hover:bg-brand-coral/10 transition-colors"
              title="Guía de transliteración"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <NumberGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
};
