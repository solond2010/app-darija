"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useContent } from "../lib/content";
import { SpeakButton } from "./SpeakButton";

// Stable day index so the word changes once per calendar day (same for the whole day).
function dayNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

/** A rotating "word of the day" pulled from the (validated) lesson vocabulary. */
export const WordOfDay: React.FC = () => {
  const vocabulary = useContent((s) => s.vocabulary);

  const word = useMemo(() => {
    const all = Object.values(vocabulary || {}).flat();
    // Dedupe by darija so the pool is clean.
    const seen = new Set<string>();
    const pool = all.filter((w) => {
      const k = w.darija.toLowerCase().trim();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    if (pool.length === 0) return null;
    return pool[dayNumber() % pool.length];
  }, [vocabulary]);

  if (!word) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className="relative overflow-hidden rounded-2xl px-4 py-3.5 border border-brand-majorelle/20"
      style={{ background: "linear-gradient(120deg, rgba(107,122,63,0.12), rgba(224,184,75,0.10))" }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sparkles className="w-3.5 h-3.5 text-brand-majorelle" />
        <span className="text-[10px] font-bold font-title text-brand-majorelle uppercase tracking-[0.15em]">
          Palabra del día
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold font-title text-brand-dark leading-tight truncate">
            {word.darija}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">{word.spanish}</p>
          {word.example && (
            <p className="text-[11px] text-slate-400 italic mt-1 truncate">“{word.example}”</p>
          )}
        </div>
        <SpeakButton text={word.darija} size={20} className="p-2.5 bg-white/70 shadow-sm flex-shrink-0" />
      </div>
    </motion.section>
  );
};

export default WordOfDay;
