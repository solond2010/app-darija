"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { LearnedWord } from "../lib/store";
import { SpeakButton } from "./SpeakButton";
import { haptics } from "../utils/haptics";

interface LessonIntroProps {
  words: LearnedWord[];
  onStart: () => void;
  onExit: () => void;
}

/**
 * "Learn these words" — one flip card at a time (Duolingo style): you see the
 * Darija word, tap to flip, and it tells you what it means. Teach before testing.
 */
export const LessonIntro: React.FC<LessonIntroProps> = ({ words, onStart, onExit }) => {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const word = words[idx];
  const isLast = idx === words.length - 1;

  // Reset the card to the front when moving to a new word. Audio is tap-only (the
  // speaker button) — not auto-played, since the TTS quality varies per word.
  useEffect(() => {
    setFlipped(false);
  }, [idx]);

  const flip = () => {
    haptics.tap();
    setFlipped((f) => !f);
  };

  const next = () => {
    haptics.light();
    if (isLast) onStart();
    else setIdx((p) => p + 1);
  };

  return (
    <div className="h-dvh flex flex-col max-w-md mx-auto relative select-none overflow-hidden">
      {/* Header: close + progress */}
      <header className="h-14 px-4 glass flex items-center gap-3 border-b border-white/40 flex-shrink-0 z-30">
        <button
          onClick={onExit}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5 stroke-2" />
        </button>
        <div className="flex-1 flex gap-1.5">
          {words.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2.5 rounded-full transition-colors duration-300 ${
                i < idx
                  ? "bg-gradient-to-r from-brand-saffron via-brand-coral to-brand-rose"
                  : i === idx
                  ? "bg-brand-coral/50"
                  : "bg-slate-200/70"
              }`}
            />
          ))}
        </div>
      </header>

      {/* Title */}
      <div className="px-5 pt-4 pb-1 flex-shrink-0 text-center">
        <p className="text-[10px] font-bold font-title text-brand-coral uppercase tracking-[0.18em]">
          Aprende esta palabra · {idx + 1}/{words.length}
        </p>
      </div>

      {/* Flip card — the same card design that already exists in the app. */}
      <main className="flex-1 min-h-0 px-5 py-3 flex flex-col items-center justify-center gap-4">
        <div onClick={flip} className="w-full max-w-sm h-56 perspective-1000 cursor-pointer">
          <div
            className={`w-full h-full duration-500 transform-style-3d relative rounded-3xl shadow-md bg-white border-2 border-brand-beige border-b-[5px] border-b-[#E0D5C0] ${
              flipped ? "rotate-y-180" : ""
            }`}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-6 text-center rounded-3xl">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-coral bg-brand-pink/20 px-3 py-1 rounded-full mb-4">
                Darija (Chat)
              </span>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold font-title text-brand-dark">{word?.darija}</h2>
                <SpeakButton text={word?.darija || ""} size={22} className="p-1.5 bg-brand-pink/15" />
              </div>
              <p className="text-[10px] text-slate-400 mt-5 animate-pulse">Haz clic para ver la traducción 🔄</p>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 text-center bg-brand-mint/10 rounded-3xl">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#1A5C4A] bg-brand-mint/30 px-3 py-1 rounded-full mb-4">
                Traducción Español
              </span>
              <h2 className="text-2xl font-bold text-brand-dark">{word?.spanish}</h2>
              {word?.example && (
                <p className="text-[11px] text-slate-500 italic mt-3 bg-white/60 px-3 py-1.5 rounded-xl max-w-[90%] leading-relaxed">
                  {word.example}
                </p>
              )}
              <p className="text-[10px] text-slate-400 mt-4">Haz clic para volver 🔄</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer button: flips the card when it's on the front, advances when flipped. */}
      <footer className="flex-shrink-0 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] glass border-t border-white/40">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { if (!flipped) flip(); else next(); }}
          className={`w-full py-4.5 rounded-[20px] font-title text-lg tracking-wide transition-all ${
            flipped ? "btn-3d-primary" : "btn-3d-mint"
          }`}
        >
          {!flipped ? "GIRAR LA TARJETA 🔄" : isLast ? "¡EMPEZAR! 🚀" : "SIGUIENTE →"}
        </motion.button>
      </footer>
    </div>
  );
};

export default LessonIntro;
