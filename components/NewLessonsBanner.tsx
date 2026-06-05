"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import { useStore } from "../lib/store";
import { useContent } from "../lib/content";
import { getNewLessons, CREATOR_NAME } from "../lib/newLessons";

/** Highlights lessons Amin added behind Sara's progress so she can do them. */
export const NewLessonsBanner: React.FC = () => {
  const { completedLessons, unlockedUnits } = useStore();
  const units = useContent((s) => s.units);

  const newOnes = getNewLessons(units, completedLessons, unlockedUnits);
  if (newOnes.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl p-4 text-white sheen"
      style={{ background: "linear-gradient(135deg, #7C6FFF 0%, #FF6B6B 60%, #FF9E2C 115%)" }}
    >
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
      <div className="relative flex items-center gap-2 mb-2.5">
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-bold font-title uppercase tracking-wider">
          ¡{CREATOR_NAME} te ha preparado algo nuevo! 🎉
        </span>
      </div>
      <p className="relative text-[11px] text-white/85 mb-3 -mt-1 leading-relaxed">
        {CREATOR_NAME} ha añadido {newOnes.length === 1 ? "una lección nueva" : `${newOnes.length} lecciones nuevas`} para ti, Sara 💛
      </p>

      <div className="relative flex flex-col gap-2">
        {newOnes.map((l) => (
          <Link key={l.id} href={`/leccion/${l.id}`}>
            <div className="bg-white/15 hover:bg-white/25 transition-colors rounded-xl px-3 py-2.5 flex items-center gap-2.5 active:scale-[0.98]">
              <span className="text-base flex-shrink-0">🆕</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider leading-none">
                  Lección {l.id}
                </p>
                <p className="text-sm font-bold font-title truncate mt-0.5">
                  {l.emoji} {l.title}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 text-white/80" />
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  );
};

export default NewLessonsBanner;
