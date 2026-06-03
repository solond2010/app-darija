"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, Sparkles } from "lucide-react";
import { useCelebration } from "../lib/celebration";

const COLORS = ["#FF9E2C", "#FFC247", "#FF6B6B", "#FF4D8D", "#5B5FEF", "#11B5A4"];

export const CelebrationOverlay: React.FC = () => {
  const levelUp = useCelebration((s) => s.levelUp);
  const clear = useCelebration((s) => s.clear);

  useEffect(() => {
    if (!levelUp) return;
    // Side cannons + a centered burst, repeated for a moment.
    const end = Date.now() + 1500;
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors: COLORS });
      confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors: COLORS });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    confetti({ particleCount: 140, spread: 100, origin: { y: 0.45 }, colors: COLORS });
    frame();
  }, [levelUp]);

  return (
    <AnimatePresence>
      {levelUp && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clear}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.7, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong relative rounded-3xl px-7 py-8 max-w-xs w-full flex flex-col items-center text-center gap-3 sheen"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -5, 5, 0], y: [0, -4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.4 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-saffron via-brand-coral to-brand-rose flex items-center justify-center glow-coral"
            >
              <Trophy className="w-12 h-12 text-white fill-yellow-300" />
            </motion.div>

            <div className="flex items-center gap-1.5 text-brand-saffron">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">¡Subiste de nivel!</span>
              <Sparkles className="w-4 h-4" />
            </div>

            <h2 className="text-4xl font-extrabold font-title text-gradient leading-none">
              Nivel {levelUp.level}
            </h2>
            <p className="text-lg font-bold font-title text-brand-dark -mt-1">{levelUp.name}</p>

            <p className="text-sm text-slate-500 leading-relaxed">
              ¡Mashallah Sara! Cada día hablas mejor Darija. 🐱💜
            </p>

            <button
              onClick={clear}
              className="btn-3d-primary w-full py-3 text-sm font-bold mt-1"
            >
              ¡Yallah, a por más!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
