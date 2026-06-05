"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { BottomNav } from "../../components/BottomNav";
import { Meshi } from "../../components/Suki";
import { useStore, getLevelInfo } from "../../lib/store";
import { Flame, Star, BookOpen, CheckCircle, Trash2, Volume2, VolumeX, ShieldAlert, Trophy, Moon, Sun, Target } from "lucide-react";
import { motion } from "framer-motion";
import { ProgressBackup } from "../../components/ProgressBackup";
import { getStoredTheme, toggleTheme, type Theme } from "../../lib/theme";
import Link from "next/link";
import { Library, ChevronRight } from "lucide-react";
import { AuthCard } from "../../components/AuthCard";
import { useAccount } from "../../lib/useAccount";
import { Pencil } from "lucide-react";
import { WeekStreak } from "../../components/WeekStreak";
import { AchievementsGallery } from "../../components/AchievementsGallery";
import { StatsSection } from "../../components/StatsSection";

export default function PerfilPage() {
  const {
    xp, streak, completedLessons, learnedWords, unlockedAchievements,
    soundsEnabled, toggleSounds, resetProgress, isHydrated, setHydrated,
    dailyGoal, setDailyGoal,
  } = useStore();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const { isAdmin } = useAccount();

  useEffect(() => {
    setTheme(getStoredTheme());
    setHydrated(true);
    setMounted(true);
  }, [setHydrated]);

  if (!mounted || !isHydrated) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-slate-400 font-title font-medium text-sm">Cargando...</p>
      </div>
    );
  }

  const levelInfo = getLevelInfo(xp);

  const handleReset = () => {
    if (window.confirm("¿De verdad quieres borrar tu progreso? Esta acción no se puede deshacer y perderás todos tus XP, racha y logros.")) {
      resetProgress();
      alert("Tu progreso ha sido reiniciado. ¡Empecemos de cero!");
    }
  };

  const statItems = [
    { label: "Racha",     value: `${streak} ${streak === 1 ? "día" : "días"}`, icon: Flame,        color: "text-orange-500 bg-orange-50", border: "border-orange-100" },
    { label: "XP",        value: xp,                                            icon: Star,         color: "text-amber-500 bg-amber-50",  border: "border-amber-100" },
    { label: "Palabras",  value: learnedWords.length,                           icon: BookOpen,     color: "text-blue-500 bg-blue-50",    border: "border-blue-100" },
    { label: "Lecciones", value: completedLessons.length,                       icon: CheckCircle,  color: "text-emerald-500 bg-emerald-50", border: "border-emerald-100" },
  ];

  return (
    <div className="min-h-screen pb-20 flex flex-col max-w-md mx-auto relative overflow-hidden">
      <Header />

      <main className="flex-1 px-4 pt-3 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6">

        {/* Avatar + name card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-3xl p-5 mt-1 sheen glow-majorelle"
          style={{ background: "linear-gradient(135deg, #5B5FEF 0%, #A855F7 55%, #FF4D8D 110%)" }}
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/20 rounded-full pointer-events-none" />
          <div className="absolute -left-4 -top-4 w-16 h-16 bg-white/20 rounded-full pointer-events-none" />

          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center text-3xl shadow-sm border-2 border-white/40">
              🧕
            </div>
            <div>
              <h3 className="text-2xl font-bold font-title text-white drop-shadow-sm">Sara</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="bg-white/25 backdrop-blur-sm rounded-full px-2.5 py-0.5">
                  <span className="text-xs font-bold text-white">
                    Nivel {levelInfo.level}: {levelInfo.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-auto bg-white/20 rounded-2xl p-2">
              <Trophy className="w-6 h-6 text-amber-300 fill-amber-300" />
            </div>
          </div>
        </motion.section>

        {/* Account (login / register) */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.04 }}
        >
          <AuthCard />
        </motion.section>

        {/* Stats grid */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.07 }}
          className="grid grid-cols-2 gap-3"
        >
          {statItems.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${stat.color} flex-shrink-0`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{stat.label}</span>
                  <span className="text-base font-bold font-title text-brand-dark leading-none block mt-0.5">{stat.value}</span>
                </div>
              </div>
            );
          })}
        </motion.section>

        {/* Weekly streak */}
        {!isAdmin && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex flex-col gap-2"
          >
            <h4 className="text-[10px] font-bold font-title text-slate-400 uppercase tracking-[0.15em] pl-1">Tu semana</h4>
            <WeekStreak />
          </motion.section>
        )}

        {/* Achievements (ocultos para la cuenta admin, que no es alumno) */}
        {!isAdmin && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.14 }}
          >
            <AchievementsGallery />
          </motion.section>
        )}

        {!isAdmin && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18 }}
          >
            <StatsSection />
          </motion.section>
        )}

        {/* Settings */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.21 }}
          className="flex flex-col gap-2"
        >
          <h4 className="text-[10px] font-bold font-title text-slate-400 uppercase tracking-[0.15em] pl-1">
            Configuración
          </h4>

          <div className="glass rounded-3xl p-4 flex flex-col gap-4">
            {/* Sound toggle */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                {soundsEnabled
                  ? <Volume2 className="w-4.5 h-4.5 text-brand-coral" />
                  : <VolumeX className="w-4.5 h-4.5 text-slate-400" />
                }
                <span>Efectos de sonido</span>
              </div>
              <button
                onClick={toggleSounds}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${soundsEnabled ? "bg-brand-coral" : "bg-slate-200"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${soundsEnabled ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            {/* Theme toggle */}
            <div className="pt-3 border-t-2 border-brand-cream flex justify-between items-center">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                {theme === "dark"
                  ? <Moon className="w-4.5 h-4.5 text-brand-majorelle" />
                  : <Sun className="w-4.5 h-4.5 text-brand-saffron" />
                }
                <span>Modo oscuro</span>
              </div>
              <button
                onClick={() => setTheme(toggleTheme())}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${theme === "dark" ? "bg-brand-majorelle" : "bg-slate-200"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            {/* Daily goal picker */}
            <div className="pt-3 border-t-2 border-brand-cream flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                  <Target className="w-4.5 h-4.5 text-brand-teal" />
                  <span>Meta diaria</span>
                </div>
                <span className="text-xs font-bold text-slate-400">{dailyGoal} XP/día</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 30, 50].map((g) => (
                  <button
                    key={g}
                    onClick={() => setDailyGoal(g)}
                    className={`py-2 rounded-xl text-xs font-bold font-title transition-all border-2 ${
                      dailyGoal === g
                        ? "bg-gradient-to-br from-brand-teal to-brand-majorelle text-white border-transparent shadow-sm"
                        : "bg-white/60 border-brand-beige text-slate-500 hover:bg-white"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor de lecciones (solo admin) */}
            {isAdmin && (
              <Link href="/admin" className="pt-3 border-t-2 border-brand-cream flex justify-between items-center group">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                  <Pencil className="w-4.5 h-4.5 text-brand-coral" />
                  <span>Editor de lecciones</span>
                </div>
                <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-brand-coral transition-colors" />
              </Link>
            )}

            {/* Biblioteca de contenido */}
            <Link href="/biblioteca" className="pt-3 border-t-2 border-brand-cream flex justify-between items-center group">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                <Library className="w-4.5 h-4.5 text-brand-majorelle" />
                <span>Biblioteca de contenido</span>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-brand-coral transition-colors" />
            </Link>

            {/* Reset */}
            <div className="pt-3 border-t-2 border-brand-cream flex justify-between items-center">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />
                <span>Reiniciar progreso</span>
              </div>
              <button
                onClick={handleReset}
                className="py-1.5 px-3 rounded-xl bg-rose-50 border-2 border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Borrar
              </button>
            </div>
          </div>
        </motion.section>

        {/* Progress backup / restore */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.26 }}
          className="flex flex-col gap-2"
        >
          <h4 className="text-[10px] font-bold font-title text-slate-400 uppercase tracking-[0.15em] pl-1">
            Tu progreso a salvo
          </h4>
          <ProgressBackup />
        </motion.section>

        {/* Meshi cheering footer */}
        <section className="my-2 flex justify-center">
          <Meshi
            mood="cheering"
            size={100}
            showBubble={true}
            bubbleText="¡Sara, eres toda una campeona! Mira todo lo que has conseguido ya. 🐱💪"
          />
        </section>

        {/* Personal touch + build marker. */}
        <div className="text-center pb-1">
          <p className="text-[11px] text-brand-coral font-title font-bold">
            Hecho con 🤍 por Amin, para Sara
          </p>
          <p className="text-[10px] text-slate-300 font-title tracking-wide mt-0.5">
            Meshi v{(process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "dev").slice(0, 7)}
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
