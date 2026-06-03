"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Check, Play, Star } from "lucide-react";
import { useStore } from "../lib/store";
import { Lesson, Unit } from "../data/lessons";
import { useContent } from "../lib/content";

export const LessonMap: React.FC = () => {
  const { completedLessons, unlockedUnits, isHydrated, setHydrated } = useStore();
  const unitsData = useContent((s) => s.units);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setMounted(true);
  }, [setHydrated]);

  if (!mounted || !isHydrated) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-slate-400 font-medium font-title text-sm">Cargando el zoco del saber...</p>
      </div>
    );
  }

  const isLessonUnlocked = (lessonId: string, unitId: string) => {
    if (!unlockedUnits.includes(unitId)) return false;

    const allLessons: { id: string; unitId: string }[] = [];
    unitsData.forEach((u) => u.lessons.forEach((l) => allLessons.push({ id: l.id, unitId: u.id })));

    const index = allLessons.findIndex((l) => l.id === lessonId);
    // First lesson overall is always unlocked; otherwise require the previous one done.
    if (index <= 0) return true;
    return completedLessons.includes(allLessons[index - 1].id);
  };

  // Winding offsets: snake pattern
  const offsetPattern = ["translate-x-0", "-translate-x-10", "translate-x-0", "translate-x-10"];

  const unitGradients = [
    "from-brand-coral to-[#FF9E9E]",
    "from-[#7C6FFF] to-[#A89EFF]",
    "from-brand-mint to-[#72D9C0]",
    "from-[#FFB347] to-[#FFD180]",
    "from-[#FF6B9D] to-[#FFB3D0]",
    "from-[#4ECDC4] to-[#96E8E3]",
  ];

  return (
    <div className="relative w-full max-w-md mx-auto pb-24 px-4">
      {unitsData.map((unit, unitIdx) => {
        const isUnitUnlocked = unlockedUnits.includes(unit.id);
        const gradClass = unitGradients[unitIdx % unitGradients.length];

        return (
          <motion.div
            key={unit.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: unitIdx * 0.06 }}
            className="mb-10 relative"
          >
            {/* Unit header */}
            <div
              className={`rounded-3xl p-4 mb-8 text-center overflow-hidden relative shadow-sm ${
                isUnitUnlocked
                  ? "text-white"
                  : "bg-slate-100 border-2 border-slate-200 text-slate-400 opacity-60"
              }`}
              style={isUnitUnlocked ? { background: `linear-gradient(135deg, var(--tw-gradient-stops))` } : {}}
            >
              {isUnitUnlocked && (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradClass}`} />
              )}
              {isUnitUnlocked && (
                <>
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />
                  <div className="absolute -left-3 -top-3 w-14 h-14 bg-white/10 rounded-full pointer-events-none" />
                </>
              )}
              <div className="relative flex items-center justify-center gap-2 mb-1">
                <span className="text-xl">{unit.emoji}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isUnitUnlocked ? "text-white/80" : "text-slate-400"
                }`}>
                  Unidad {unit.number}
                </span>
              </div>
              <h2 className="relative text-lg font-bold font-title">{unit.title}</h2>
              <p className={`relative text-xs mt-0.5 ${isUnitUnlocked ? "text-white/75" : "text-slate-400"}`}>
                {unit.description}
              </p>
            </div>

            {/* Path nodes */}
            <div className="flex flex-col items-center gap-10 relative py-4">
              {/* Connecting line */}
              {isUnitUnlocked && (
                <div className="absolute top-8 bottom-8 w-1 bg-gradient-to-b from-brand-beige via-brand-pink/30 to-brand-beige z-0 pointer-events-none rounded-full" />
              )}

              {unit.lessons.map((lesson, index) => {
                const unlocked = isLessonUnlocked(lesson.id, unit.id);
                const completed = completedLessons.includes(lesson.id);
                const posClass = offsetPattern[index % 4];

                return (
                  <div
                    key={lesson.id}
                    className={`flex flex-col items-center z-10 transition-transform ${posClass}`}
                  >
                    <div className="relative">
                      {/* Pulse ring for next unlocked lesson */}
                      {unlocked && !completed && (
                        <span className="absolute -inset-3 rounded-full bg-brand-coral/20 animate-ping pointer-events-none" />
                      )}

                      {unlocked ? (
                        <Link href={`/leccion/${lesson.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.93 }}
                            className={`w-[68px] h-[68px] rounded-full flex items-center justify-center text-xl font-bold transition-all ${
                              completed
                                ? "bg-gradient-to-br from-brand-teal to-[#0A8576] text-white border-[3px] border-white/60 shadow-[0_6px_18px_rgba(17,181,164,0.45)]"
                                : "bg-gradient-to-br from-brand-saffron via-brand-coral to-brand-rose text-white border-[3px] border-white/60 glow-coral"
                            }`}
                          >
                            {completed
                              ? <Check className="w-7 h-7 stroke-[3]" />
                              : <Play className="w-6 h-6 fill-white stroke-none ml-0.5" />
                            }
                          </motion.button>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-[68px] h-[68px] rounded-full flex items-center justify-center bg-slate-200 border-[3px] border-slate-300 text-slate-400 shadow-[0_3px_0_#CBD5E1] cursor-not-allowed"
                        >
                          <Lock className="w-6 h-6 stroke-2" />
                        </button>
                      )}
                    </div>

                    {/* Label */}
                    <div className="mt-2.5 text-center max-w-[120px]">
                      <p className={`text-[11px] font-bold font-title ${unlocked ? "text-brand-dark" : "text-slate-400"}`}>
                        Lección {lesson.id}
                      </p>
                      <p className={`text-[10px] leading-snug mt-0.5 line-clamp-2 ${unlocked ? "text-slate-500 font-medium" : "text-slate-400"}`}>
                        {lesson.title}
                      </p>
                      {completed && (
                        <div className="flex items-center justify-center gap-0.5 mt-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {unitIdx < unitsData.length - 1 && (
              <div className="flex justify-center my-4 opacity-40 select-none">
                <span className="text-lg">🎪 🇲🇦 🎪</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
