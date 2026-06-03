"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";
import { Meshi } from "../components/Suki";
import { LessonMap } from "../components/LessonMap";
import { useStore, getLevelInfo } from "../lib/store";
import { getRandomMessage } from "../data/meshi-messages";
import { useContent } from "../lib/content";
import { Flame, Star, Trophy, Zap, Target, ChevronRight, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const {
    xp, streak, isHydrated,
    todayXP, dailyGoal, lastActiveDate, completedLessons, unlockedUnits,
  } = useStore();
  const [mounted, setMounted] = useState(false);
  const [meshiMsg, setMeshiMsg] = useState({ text: "", emoji: "😺" });
  const unitsData = useContent((s) => s.units);

  useEffect(() => {
    setMounted(true);
    setMeshiMsg(getRandomMessage("greetings"));
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
  const dailyGoalMet = todayXP >= dailyGoal;
  const dailyProgressPercent = Math.min(100, (todayXP / dailyGoal) * 100);

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

        {/* Meshi welcome card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-3xl px-4 pt-3 pb-4 flex items-center mt-1"
        >
          <Meshi
            mood="normal"
            size={100}
            showBubble={true}
            bubbleText={`¡Hola Sara! 🐱 ${meshiMsg.text}`}
          />
        </motion.section>

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
              {todayXP} / {dailyGoal} XP
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

        {/* Level / XP card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="relative overflow-hidden rounded-3xl p-5 sheen glow-coral"
          style={{ background: "linear-gradient(135deg, #5B5FEF 0%, #FF6B6B 52%, #FF9E2C 110%)" }}
        >
          {/* Decorative circles */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute right-16 -top-4 w-16 h-16 bg-white/5 rounded-full pointer-events-none" />

          <div className="relative flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] bg-white/25 px-2.5 py-1 rounded-full uppercase font-bold tracking-wider text-white">
                Nivel {levelInfo.level}
              </span>
              <h3 className="text-2xl font-bold font-title text-white mt-1.5 leading-none">
                {levelInfo.name}
              </h3>
            </div>
            <div className="bg-white/20 p-2.5 rounded-2xl">
              <Trophy className="w-6 h-6 text-yellow-300 fill-yellow-300" />
            </div>
          </div>

          {/* XP bar */}
          <div className="relative flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-white/90">
              <span>{xp} XP</span>
              {levelInfo.level < 5
                ? <span>{levelInfo.max - xp} XP para nivel {levelInfo.level + 1}</span>
                : <span>¡Nivel máximo! 👑</span>
              }
            </div>
            <div className="w-full h-3 bg-white/25 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="h-full bg-yellow-300 rounded-full shadow-sm"
              />
            </div>
          </div>

          {/* Micro stats */}
          <div className="relative flex gap-2 mt-3">
            <div className="flex-1 flex items-center gap-1.5 bg-white/15 rounded-xl px-2.5 py-1.5">
              <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 flex-shrink-0" />
              <span className="text-[11px] font-bold text-white">{streak} {streak === 1 ? "día" : "días"}</span>
            </div>
            <div className="flex-1 flex items-center gap-1.5 bg-white/15 rounded-xl px-2.5 py-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-200 flex-shrink-0" />
              <span className="text-[11px] font-bold text-white truncate">{xp} XP totales</span>
            </div>
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
