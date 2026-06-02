"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { BottomNav } from "../../components/BottomNav";
import { Meshi } from "../../components/Suki";
import { useStore, getLevelInfo } from "../../lib/store";
import { achievementsData } from "../../data/achievements";
import { Flame, Star, BookOpen, CheckCircle, Trash2, Volume2, VolumeX, ShieldAlert, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function PerfilPage() {
  const {
    xp, streak, completedLessons, learnedWords, unlockedAchievements,
    soundsEnabled, toggleSounds, resetProgress, isHydrated, setHydrated,
  } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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
    <div className="min-h-screen bg-brand-cream pb-20 flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-brand-lavender/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 -right-16 w-40 h-40 bg-brand-mint/20 rounded-full blur-3xl pointer-events-none" />

      <Header />

      <main className="flex-1 px-4 pt-3 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6">

        {/* Avatar + name card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-3xl p-5 mt-1"
          style={{ background: "linear-gradient(135deg, #E8D5FF 0%, #FFB4B4 100%)" }}
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/20 rounded-full pointer-events-none" />
          <div className="absolute -left-4 -top-4 w-16 h-16 bg-white/20 rounded-full pointer-events-none" />

          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center text-3xl shadow-sm border-2 border-white/60">
              🧕
            </div>
            <div>
              <h3 className="text-2xl font-bold font-title text-brand-dark">Sara</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="bg-white/40 backdrop-blur-sm rounded-full px-2.5 py-0.5">
                  <span className="text-xs font-bold text-brand-dark">
                    Nivel {levelInfo.level}: {levelInfo.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-auto bg-white/30 rounded-2xl p-2">
              <Trophy className="w-6 h-6 text-brand-coral" />
            </div>
          </div>
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
              <div key={i} className={`bg-white rounded-2xl p-4 border-2 ${stat.border} flex items-center gap-3 shadow-sm`}>
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

        {/* Achievements */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14 }}
          className="flex flex-col gap-2.5"
        >
          <h4 className="text-[10px] font-bold font-title text-slate-400 uppercase tracking-[0.15em] pl-1">
            Insignias y Logros
          </h4>

          {achievementsData.map((badge, i) => {
            const unlocked = unlockedAchievements.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 + i * 0.04 }}
                className={`bg-white rounded-2xl p-4 border-2 shadow-sm flex items-start gap-3 relative overflow-hidden ${
                  unlocked ? "border-brand-lavender/60" : "border-brand-beige opacity-55"
                }`}
              >
                {unlocked && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-brand-lavender/15 rounded-bl-3xl pointer-events-none" />
                )}
                <div className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  unlocked ? "bg-brand-lavender/30" : "bg-slate-100"
                }`}>
                  {unlocked ? badge.emoji : "🔒"}
                </div>
                <div className="flex-1 min-w-0 relative">
                  <h5 className="font-bold text-sm text-brand-dark font-title">{badge.title}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{badge.description}</p>
                  {unlocked && (
                    <p className="text-[10px] text-brand-coral font-semibold mt-1.5 italic leading-relaxed">
                      &quot;{badge.unlockedMessage}&quot;
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.section>

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

          <div className="bg-white rounded-3xl p-4 border-2 border-brand-beige flex flex-col gap-4 shadow-sm">
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

        {/* Meshi cheering footer */}
        <section className="my-2 flex justify-center">
          <Meshi
            mood="cheering"
            size={100}
            showBubble={true}
            bubbleText="¡Sara, eres toda una campeona! Mira todo lo que has conseguido ya. 🐱💪"
          />
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
