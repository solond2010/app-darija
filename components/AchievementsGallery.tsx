"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { useStore } from "../lib/store";
import { useContent } from "../lib/content";
import { achievementsData, Achievement } from "../data/achievements";

function progressFor(
  a: Achievement,
  ctx: { xp: number; streak: number; completed: string[]; units: { id: string; lessons: { id: string }[] }[] }
): { ratio: number; label: string } {
  const cap = (n: number, d: number) => ({ ratio: Math.max(0, Math.min(1, n / d)), label: `${Math.min(n, d)}/${d}` });
  switch (a.conditionType) {
    case "xp": {
      const d = Number(a.conditionValue);
      return { ratio: Math.min(1, ctx.xp / d), label: `${Math.min(ctx.xp, d)}/${d} XP` };
    }
    case "streak": {
      const d = Number(a.conditionValue);
      return { ratio: Math.min(1, ctx.streak / d), label: `${Math.min(ctx.streak, d)}/${d} días` };
    }
    case "lesson_completed":
      return { ...cap(ctx.completed.length, Number(a.conditionValue)), label: `${Math.min(ctx.completed.length, Number(a.conditionValue))}/${a.conditionValue}` };
    case "unit_completed": {
      const unit = ctx.units.find((u) => u.id === a.conditionValue);
      if (!unit || unit.lessons.length === 0) return { ratio: 0, label: "" };
      const done = unit.lessons.filter((l) => ctx.completed.includes(l.id)).length;
      return { ratio: done / unit.lessons.length, label: `${done}/${unit.lessons.length} lec.` };
    }
    default:
      return { ratio: 0, label: "" };
  }
}

export const AchievementsGallery: React.FC = () => {
  const { xp, streak, completedLessons, unlockedAchievements } = useStore();
  const units = useContent((s) => s.units);

  const total = achievementsData.length;
  const unlockedCount = achievementsData.filter((a) => unlockedAchievements.includes(a.id)).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between pl-1">
        <h4 className="text-[10px] font-bold font-title text-slate-400 uppercase tracking-[0.15em]">
          Logros
        </h4>
        <span className="text-[11px] font-bold font-title text-brand-coral">
          {unlockedCount}/{total} 🏆
        </span>
      </div>

      {/* overall progress */}
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(unlockedCount / total) * 100}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-brand-saffron via-brand-coral to-brand-rose"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {achievementsData.map((a, i) => {
          const unlocked = unlockedAchievements.includes(a.id);
          const { ratio, label } = progressFor(a, { xp, streak, completed: completedLessons, units });
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.035, type: "spring", stiffness: 320, damping: 22 }}
              className={`relative rounded-2xl p-3 flex flex-col items-center text-center gap-1 overflow-hidden border ${
                unlocked
                  ? "border-brand-saffron/30 shadow-[0_4px_16px_rgba(255,158,44,0.18)]"
                  : "border-slate-100 bg-white/60"
              }`}
              style={unlocked ? { background: "linear-gradient(150deg, rgba(255,158,44,0.16), rgba(255,107,107,0.12))" } : {}}
            >
              {unlocked && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
              )}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                  unlocked ? "bg-white/70 shadow-sm" : "bg-slate-100"
                }`}
              >
                {unlocked ? a.emoji : <span className="grayscale opacity-50 text-xl">{a.emoji}</span>}
              </div>
              <h5 className={`text-[11px] font-bold font-title leading-tight mt-0.5 ${unlocked ? "text-brand-dark" : "text-slate-400"}`}>
                {a.title}
              </h5>

              {unlocked ? (
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Conseguido</span>
              ) : (
                <div className="w-full mt-0.5">
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-saffron to-brand-coral"
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 mt-0.5 inline-flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> {label || "Pendiente"}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsGallery;
