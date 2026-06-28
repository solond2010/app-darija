"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, Tag } from "lucide-react";
import { useStore } from "../lib/store";

const DAY_LETTERS = ["D", "L", "M", "X", "J", "V", "S"];

export const StatsSection: React.FC = () => {
  const { xpHistory, learnedWords } = useStore();

  // Last 7 calendar days of XP.
  const week = useMemo(() => {
    const out: { label: string; xp: number; isToday: boolean }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toLocaleDateString("en-CA");
      out.push({
        label: DAY_LETTERS[d.getDay()],
        xp: (xpHistory && xpHistory[key]) || 0,
        isToday: i === 0,
      });
    }
    return out;
  }, [xpHistory]);

  const maxXp = Math.max(1, ...week.map((d) => d.xp));
  const weekTotal = week.reduce((s, d) => s + d.xp, 0);

  // Words per category.
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    learnedWords.forEach((w) => {
      const c = w.category || "Otras";
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [learnedWords]);
  const maxCat = Math.max(1, ...categories.map(([, n]) => n));

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-[10px] font-bold font-title text-slate-400 uppercase tracking-[0.15em] pl-1">
        Estadísticas
      </h4>

      {/* XP this week */}
      <div className="glass rounded-3xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-bold font-title text-brand-dark">
            <div className="p-1.5 rounded-lg bg-brand-coral/15">
              <BarChart3 className="w-3.5 h-3.5 text-brand-coral" />
            </div>
            XP esta semana
          </div>
          <span className="text-xs font-bold text-slate-400">{weekTotal} XP</span>
        </div>
        <div className="flex items-end justify-between gap-1.5 h-24">
          {week.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <span className={`text-[8px] font-bold ${d.xp > 0 ? "text-brand-amber" : "text-transparent"}`}>{d.xp}</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.xp / maxXp) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                className={`w-full rounded-t-lg min-h-[3px] ${
                  d.isToday
                    ? "bg-gradient-to-t from-brand-coral to-brand-saffron shadow-[0_0_10px_rgba(107,122,63,0.45)]"
                    : d.xp > 0
                    ? "bg-gradient-to-t from-brand-coral/60 to-brand-saffron/60"
                    : "bg-slate-100"
                }`}
              />
              <span className={`text-[9px] font-bold font-title ${d.isToday ? "text-brand-coral" : "text-slate-400"}`}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Words per category */}
      <div className="glass rounded-3xl p-4">
        <div className="flex items-center gap-2 text-sm font-bold font-title text-brand-dark mb-3">
          <div className="p-1.5 rounded-lg bg-brand-majorelle/15">
            <Tag className="w-3.5 h-3.5 text-brand-majorelle" />
          </div>
          Palabras por categoría
        </div>
        {categories.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2">Completa lecciones para ver tus categorías 🐱</p>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map(([cat, n], i) => (
              <div key={cat} className="flex items-center gap-2.5">
                <span className="text-[11px] font-semibold text-slate-600 w-24 flex-shrink-0 truncate">{cat}</span>
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(n / maxCat) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-brand-majorelle to-brand-coral"
                  />
                </div>
                <span className="text-[11px] font-bold font-title text-brand-dark w-5 text-right">{n}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsSection;
