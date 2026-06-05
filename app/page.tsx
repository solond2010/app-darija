"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";
import { LessonMap } from "../components/LessonMap";
import { WeekStreak } from "../components/WeekStreak";
import { WordOfDay } from "../components/WordOfDay";
import { NewLessonsBanner } from "../components/NewLessonsBanner";
import { useStore, getLevelInfo } from "../lib/store";
import { useContent } from "../lib/content";
import { Zap, Target, ChevronRight, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const {
    xp, streak, isHydrated,
    todayXP, todayXPDate, dailyGoal, lastActiveDate, completedLessons, unlockedUnits,
  } = useStore();
  const [mounted, setMounted] = useState(false);
  const unitsData = useContent((s) => s.units);

  // Subtle scroll parallax for the hero's decorative blobs.
  const { scrollY } = useScroll();
  const blobY = useTransform(scrollY, [0, 500], [0, -55]);
  const blobY2 = useTransform(scrollY, [0, 500], [0, 35]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Find next lesson to continue
  const nextLesson = useMemo(() => {
    for (const unit of unitsData) {
      if (!unlockedUnits.includes(unit.id)) continue;
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id)) {
          return { lesson, unit };
        }
      }
    }
    return null;
  }, [unlockedUnits, completedLessons, unitsData]);

  if (!mounted || !isHydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-slate-400 font-title font-medium text-sm">Cargando Meshi...</p>
      </div>
    );
  }

  const levelInfo = getLevelInfo(xp);
  const xpNeeded = levelInfo.max - levelInfo.min;
  const xpProgress = xp - levelInfo.min;
  const progressPercent = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100));

  const today = new Date().toLocaleDateString("en-CA");
  const isStreakAtRisk = streak > 0 && lastActiveDate !== today;
  // Only count today's XP; on a new day it resets visually until XP is earned.
  const todayXPDisplay = todayXPDate === today ? todayXP : 0;
  const dailyGoalMet = todayXPDisplay >= dailyGoal;
  const dailyProgressPercent = Math.min(100, (todayXPDisplay / dailyGoal) * 100);
  const ringDeg = Math.round((progressPercent / 100) * 360);
  const xpToNext = levelInfo.level < 5 ? levelInfo.max - xp : 0;

  return (
    <div className="min-h-screen pb-20 flex flex-col max-w-md mx-auto relative overflow-hidden">

      <Header />

      <main className="flex-1 px-4 pt-3 flex flex-col gap-3.5 overflow-y-auto no-scrollbar pb-6">

        {/* Streak at risk banner */}
        <AnimatePresence>
          {isStreakAtRisk && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3"
            >
              <div className="bg-amber-100 rounded-xl p-2 flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-700 font-title">¡Tu racha de {streak} días está en peligro!</p>
                <p className="text-[11px] text-amber-600 mt-0.5">Completa una lección hoy para mantenerla 🔥</p>
              </div>
              {nextLesson && (
                <Link href={`/leccion/${nextLesson.lesson.id}`}>
                  <div className="bg-amber-500 rounded-xl p-2 flex-shrink-0">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* New lessons Amin added behind Sara's progress */}
        <NewLessonsBanner />

        {/* HERO — level ring + XP */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-[28px] p-5 sheen glow-coral mt-1"
          style={{ background: "linear-gradient(135deg, #5B5FEF 0%, #FF6B6B 52%, #FF9E2C 110%)" }}
        >
          <motion.div style={{ y: blobY }} className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
          <motion.div style={{ y: blobY2 }} className="absolute -left-6 -top-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />

          <div className="relative flex items-center gap-4">
            {/* Progress ring */}
            <div
              className="w-[86px] h-[86px] rounded-full grid place-items-center flex-shrink-0"
              style={{ background: `conic-gradient(#FFE08A 0deg ${ringDeg}deg, rgba(255,255,255,0.22) ${ringDeg}deg 360deg)` }}
            >
              <div className="w-[68px] h-[68px] rounded-full bg-black/15 backdrop-blur-sm grid place-items-center text-white text-center">
                <div>
                  <div className="text-lg font-bold font-title leading-none">{Math.round(progressPercent)}%</div>
                  <div className="text-[8px] font-bold tracking-[1.5px] opacity-85 mt-0.5">NIVEL {levelInfo.level}</div>
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <span className="inline-block text-[10px] bg-white/25 px-2.5 py-1 rounded-full uppercase font-bold tracking-wider text-white">
                {levelInfo.name}
              </span>
              <h2 className="text-2xl font-bold font-title text-white mt-1.5 leading-none">{xp} XP</h2>
              <p className="text-xs font-bold text-white/90 mt-1.5">
                {levelInfo.level < 5 ? `${xpToNext} XP para Nivel ${levelInfo.level + 1}` : "¡Nivel máximo! 👑"}
                <span className="opacity-90"> · 🔥 {streak} {streak === 1 ? "día" : "días"}</span>
              </p>
              <div className="h-2.5 bg-white/28 rounded-full mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#FFE08A] rounded-full shadow-[0_0_12px_rgba(255,224,138,0.8)]"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Weekly streak strip */}
        <WeekStreak />

        {/* Word of the day (rotates daily, from the lesson vocabulary) */}
        <WordOfDay />

        {/* Continue lesson button */}
        {nextLesson && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <Link href={`/leccion/${nextLesson.lesson.id}`}>
              <div className="glass rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:bg-white/80 transition-all active:scale-[0.98] border-l-4 border-l-brand-coral">
                <div className="bg-gradient-to-br from-brand-saffron to-brand-coral rounded-xl p-2.5 flex-shrink-0 glow-coral">
                  <Zap className="w-4.5 h-4.5 text-white fill-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Continuar</p>
                  <p className="text-sm font-bold font-title text-brand-dark truncate mt-0.5">
                    {nextLesson.unit.emoji} {nextLesson.lesson.title}
                  </p>
                </div>
                <ChevronRight className="w-4.5 h-4.5 text-brand-coral flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
        )}

        {/* Daily goal card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass rounded-2xl px-4 py-3.5"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${dailyGoalMet ? "bg-emerald-100" : "bg-brand-pink/20"}`}>
                <Target className={`w-3.5 h-3.5 ${dailyGoalMet ? "text-emerald-600" : "text-brand-coral"}`} />
              </div>
              <span className="text-xs font-bold font-title text-brand-dark">
                {dailyGoalMet ? "¡Meta diaria cumplida! 🎉" : "Meta diaria"}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {todayXPDisplay} / {dailyGoal} XP
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dailyProgressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${dailyGoalMet ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-brand-coral to-brand-pink"}`}
            />
          </div>
        </motion.section>

        {/* Lesson map section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="flex-1"
        >
          <div className="text-center mb-5">
            <h4 className="text-sm font-extrabold font-title text-gradient uppercase tracking-[0.18em]">
              Tu Ruta de Aprendizaje
            </h4>
            <div className="w-10 h-1 bg-gradient-to-r from-brand-saffron via-brand-coral to-brand-rose mx-auto mt-2 rounded-full" />
          </div>
          <LessonMap />
        </motion.section>
      </main>

      <BottomNav />
    </div>
  );
}
