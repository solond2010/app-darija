"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../lib/store";
import { Flame, Star, Heart, HelpCircle, Volume2, VolumeX, Timer } from "lucide-react";
import { NumberGuide } from "./NumberGuide";
import { ThemeToggle } from "./ThemeToggle";

function useNextLifeTimer(lastLifeLostAt: string | null, lives: number) {
  const [secondsUntilNext, setSecondsUntilNext] = useState<number | null>(null);

  useEffect(() => {
    if (lives >= 5 || !lastLifeLostAt) {
      setSecondsUntilNext(null);
      return;
    }

    const REFILL_MS = 30 * 60 * 1000; // 30 minutes per life

    const tick = () => {
      const lastLost = new Date(lastLifeLostAt).getTime();
      const now = Date.now();
      const elapsed = now - lastLost;
      const periodsElapsed = Math.floor(elapsed / REFILL_MS);
      const nextRefillAt = lastLost + (periodsElapsed + 1) * REFILL_MS;
      const remaining = Math.max(0, Math.ceil((nextRefillAt - now) / 1000));
      setSecondsUntilNext(remaining);
    };

    tick();
    const interval = setInterval(tick, 10000); // update every 10s
    return () => clearInterval(interval);
  }, [lastLifeLostAt, lives]);

  if (secondsUntilNext === null) return null;
  const mins = Math.floor(secondsUntilNext / 60);
  const secs = secondsUntilNext % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export const Header: React.FC = () => {
  const { streak, xp, lives, lastLifeLostAt, soundsEnabled, toggleSounds, isHydrated } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const timerLabel = useNextLifeTimer(lastLifeLostAt, lives);

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
            {streak}
          </div>

          {/* XP */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold font-title ${
            xp > 0 ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-400"
          }`}>
            <Star className={`w-3.5 h-3.5 ${xp > 0 ? "fill-amber-400 text-amber-400" : ""}`} />
            {xp}
          </div>

          {/* Lives + timer */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold font-title ${
            lives >= 5
              ? "bg-rose-50 text-rose-400"
              : lives > 2
              ? "bg-rose-50 text-rose-400"
              : lives > 0
              ? "bg-red-100 text-red-500 animate-pulse"
              : "bg-slate-50 text-slate-400"
          }`}>
            <Heart className={`w-3.5 h-3.5 flex-shrink-0 ${lives > 0 ? "fill-rose-400 text-rose-400" : ""}`} />
            {lives >= 5 ? (
              <span>{lives}</span>
            ) : timerLabel ? (
              <span className="flex items-center gap-0.5">
                {lives} <Timer className="w-2.5 h-2.5 opacity-70" /> {timerLabel}
              </span>
            ) : (
              <span>{lives}</span>
            )}
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
