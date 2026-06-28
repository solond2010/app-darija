"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Meshi, MeshiMood } from "./Suki";
import { haptics } from "../utils/haptics";

const KEY = "meshi-onboarding-done";

interface Slide {
  mood: MeshiMood;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    mood: "cheering",
    title: "¡Salam, Sara! 🐱",
    body: "Soy Meshi, tu gatito. Amin ha hecho esta app solo para ti, con mucho cariño. 🤍",
  },
  {
    mood: "normal",
    title: "Darija del norte 🇲🇦",
    body: "Vas a aprender el darija de Tetuán y Tánger — el de verdad, para hablar con la familia.",
  },
  {
    mood: "celebrating",
    title: "A tu ritmo, sin estrés ✨",
    body: "Gana XP ⭐, mantén tu racha 🔥, escucha cómo suena 🔊 y sube de nivel. Sin vidas, sin agobios.",
  },
  {
    mood: "perfect",
    title: "¿Lista? ¡Yallah! 💪",
    body: "Empieza por los saludos y poco a poco sorprenderás a toda la familia. ¡Vamos!",
  },
];

export const Onboarding: React.FC = () => {
  const [show, setShow] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  if (!show) return null;

  const finish = () => {
    try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    haptics.success();
    setShow(false);
  };

  const next = () => {
    haptics.tap();
    if (i < SLIDES.length - 1) setI((p) => p + 1);
    else finish();
  };

  const slide = SLIDES[i];
  const isLast = i === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-between px-7 py-10 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] text-white overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(160deg, #6B7A3F 0%, #4F5A2C 55%, #1A1A1A 115%)" }} />
      <div className="absolute -z-10 -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full" />
      <div className="absolute -z-10 -bottom-24 -left-16 w-72 h-72 bg-white/10 rounded-full" />

      {/* Skip */}
      <div className="w-full flex justify-end">
        {!isLast && (
          <button onClick={finish} className="text-xs font-bold font-title text-white/70 hover:text-white px-3 py-1.5">
            Saltar
          </button>
        )}
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 w-full max-w-sm">
        <AnimatePresence>
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="drop-shadow-2xl">
              <Meshi mood={slide.mood} size={170} showBubble={false} interactive={false} />
            </div>
            <h2 className="text-3xl font-extrabold font-title leading-tight drop-shadow-sm">{slide.title}</h2>
            <p className="text-base font-medium text-white/90 leading-relaxed px-2">{slide.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + button */}
      <div className="w-full max-w-sm flex flex-col items-center gap-5">
        <div className="flex items-center gap-2">
          {SLIDES.map((_, idx) => (
            <motion.span
              key={idx}
              animate={{ width: idx === i ? 22 : 8, opacity: idx === i ? 1 : 0.5 }}
              className="h-2 rounded-full bg-white"
            />
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={next}
          className="w-full py-4 rounded-[20px] bg-white text-brand-coral font-extrabold font-title text-lg tracking-wide shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
        >
          {isLast ? "¡Empezar! 🚀" : "Siguiente →"}
        </motion.button>
      </div>
    </div>
  );
};

export default Onboarding;
