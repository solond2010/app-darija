"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, Sparkles, Flame } from "lucide-react";
import { useCelebration } from "../lib/celebration";

const WARM = ["#FF9E2C", "#FFC247", "#FF6B6B", "#FF4D8D", "#5B5FEF", "#11B5A4"];
const FIRE = ["#FF9E2C", "#FFC247", "#FF6B6B", "#E2725B", "#FF4D00"];

export const CelebrationOverlay: React.FC = () => {
  const current = useCelebration((s) => s.queue[0]);
  const dismiss = useCelebration((s) => s.dismiss);

  useEffect(() => {
    if (!current) return;
    const colors = current.kind === "streak" ? FIRE : WARM;
    confetti({ particleCount: 140, spread: 100, origin: { y: 0.45 }, colors });
    const end = Date.now() + 1400;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [current]);

  return (
    <AnimatePresence mode="wait">
      {current && (
        <motion.div
          key={JSON.stringify(current)}
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
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
            {current.kind === "level" && <LevelContent level={current.level} name={current.name} />}
            {current.kind === "achievement" && <AchievementContent emoji={current.emoji} title={current.title} message={current.message} />}
            {current.kind === "streak" && <StreakContent days={current.days} />}

            <button onClick={dismiss} className="btn-3d-primary w-full py-3 text-sm font-bold mt-1">
              ¡Yallah, a por más!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Badge: React.FC<{ children: React.ReactNode; gradient: string }> = ({ children, gradient }) => (
  <motion.div
    animate={{ rotate: [0, -8, 8, -5, 5, 0], y: [0, -4, 0] }}
    transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.4 }}
    className={`w-24 h-24 rounded-3xl ${gradient} flex items-center justify-center glow-coral`}
  >
    {children}
  </motion.div>
);

function LevelContent({ level, name }: { level: number; name: string }) {
  return (
    <>
      <Badge gradient="bg-gradient-to-br from-brand-saffron via-brand-coral to-brand-rose">
        <Trophy className="w-12 h-12 text-white fill-yellow-300" />
      </Badge>
      <div className="flex items-center gap-1.5 text-brand-saffron">
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-[0.2em]">¡Subiste de nivel!</span>
        <Sparkles className="w-4 h-4" />
      </div>
      <h2 className="text-4xl font-extrabold font-title text-gradient leading-none">Nivel {level}</h2>
      <p className="text-lg font-bold font-title text-brand-dark -mt-1">{name}</p>
      <p className="text-sm text-slate-500 leading-relaxed">¡Mashallah Sara! Cada día hablas mejor Darija. 🐱💜</p>
    </>
  );
}

function AchievementContent({ emoji, title, message }: { emoji: string; title: string; message: string }) {
  return (
    <>
      <Badge gradient="bg-gradient-to-br from-brand-majorelle via-brand-rose to-brand-coral">
        <span className="text-5xl">{emoji}</span>
      </Badge>
      <div className="flex items-center gap-1.5 text-brand-majorelle">
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-[0.2em]">¡Logro desbloqueado!</span>
        <Sparkles className="w-4 h-4" />
      </div>
      <h2 className="text-2xl font-extrabold font-title text-gradient leading-tight">{title}</h2>
      <p className="text-sm text-slate-500 italic leading-relaxed">&quot;{message}&quot;</p>
    </>
  );
}

function StreakContent({ days }: { days: number }) {
  return (
    <>
      <Badge gradient="bg-gradient-to-br from-brand-amber via-brand-saffron to-[#FF4D00]">
        <Flame className="w-12 h-12 text-white fill-yellow-200" />
      </Badge>
      <div className="flex items-center gap-1.5 text-brand-saffron">
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-[0.2em]">¡Racha en marcha!</span>
        <Sparkles className="w-4 h-4" />
      </div>
      <h2 className="text-4xl font-extrabold font-title text-gradient leading-none">{days} {days === 1 ? "día" : "días"} 🔥</h2>
      <p className="text-sm text-slate-500 leading-relaxed">
        {days === 1 ? "¡Empieza la racha! Vuelve mañana para no perderla." : `¡${days} días seguidos! Sigue así, Sara. 🐱`}
      </p>
    </>
  );
}
