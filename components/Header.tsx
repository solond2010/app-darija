"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { Flame, Star, HelpCircle, Volume2, VolumeX } from "lucide-react";
import { Meshi } from "./Suki";
import { NumberGuide } from "./NumberGuide";
import { ThemeToggle } from "./ThemeToggle";

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

export const Header: React.FC = () => {
  const { streak, xp, soundsEnabled, toggleSounds, isHydrated } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isHydrated) {
    return (
      <header className="sticky top-0 h-16 glass border-b border-white/40 flex items-center justify-between px-4 z-40 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 skeleton rounded-2xl" />
          <div className="w-16 h-5 skeleton rounded-lg" />
        </div>
        <div className="w-28 h-8 skeleton rounded-2xl" />
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 max-w-md mx-auto w-full">
        <div className="relative h-16 px-3.5 flex items-center justify-between glass border-b border-white/40">
          {/* soft gradient hairline at the very bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-coral/45 to-transparent pointer-events-none" />

          {/* Left — the real Meshi cat + wordmark */}
          <div className="flex items-center gap-2.5 min-w-0">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="relative w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ring-1 ring-white/70 shadow-[0_4px_14px_rgba(255,107,107,0.25)]"
              style={{ background: "linear-gradient(135deg, rgba(255,158,44,0.22), rgba(255,107,107,0.18), rgba(91,95,239,0.20))" }}
            >
              <Meshi mood="normal" size={42} showBubble={false} interactive={false} />
            </motion.div>
            <div className="leading-none">
              <span className="block font-extrabold text-[19px] font-title text-gradient tracking-tight">
                Meshi
              </span>
              <span className="block text-[8.5px] font-bold text-slate-400 tracking-[0.28em] uppercase mt-0.5">
                Darija
              </span>
            </div>
          </div>

          {/* Right — unified stats capsule + compact controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-2xl bg-white/65 dark:bg-white/10 border border-white/80 shadow-sm backdrop-blur-md">
              {/* Streak */}
              <span className={`flex items-center gap-1 text-[15px] font-extrabold font-title ${streak > 0 ? "text-orange-500" : "text-slate-400"}`}>
                <Flame className={`w-4 h-4 ${streak > 0 ? "fill-orange-400 text-orange-400" : ""}`} />
                <PopNumber value={streak} />
              </span>
              <span className="w-px h-4 bg-slate-200/80" />
              {/* XP */}
              <span className={`flex items-center gap-1 text-[15px] font-extrabold font-title ${xp > 0 ? "text-amber-500" : "text-slate-400"}`}>
                <Star className={`w-4 h-4 ${xp > 0 ? "fill-amber-400 text-amber-400" : ""}`} />
                <PopNumber value={xp} />
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center">
              <button
                onClick={toggleSounds}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-coral hover:bg-brand-coral/10 transition-colors"
                title={soundsEnabled ? "Silenciar" : "Activar sonido"}
              >
                {soundsEnabled ? <Volume2 className="w-[18px] h-[18px]" /> : <VolumeX className="w-[18px] h-[18px]" />}
              </button>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-coral hover:bg-brand-coral/10 transition-colors"
                title="Guía de transliteración (números)"
              >
                <HelpCircle className="w-[18px] h-[18px]" />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <NumberGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
};
