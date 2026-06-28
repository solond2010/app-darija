"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useStore } from "../lib/store";

/**
 * Weekly streak strip (Mon–Sun). A day counts as "active" if it falls within the
 * current streak window (the `streak` consecutive days ending on lastActiveDate).
 */
export const WeekStreak: React.FC<{ className?: string }> = ({ className = "" }) => {
  const streak = useStore((s) => s.streak);
  const lastActiveDate = useStore((s) => s.lastActiveDate);

  const weekDays = useMemo(() => {
    const now = new Date();
    const dow = (now.getDay() + 6) % 7; // 0 = Monday … 6 = Sunday
    const monday = new Date(now);
    monday.setDate(now.getDate() - dow);
    monday.setHours(0, 0, 0, 0);
    const lastActive = lastActiveDate ? new Date(`${lastActiveDate}T00:00:00`) : null;
    const start = lastActive ? new Date(lastActive) : null;
    if (start) start.setDate(start.getDate() - (streak - 1));
    const labels = ["L", "M", "X", "J", "V", "S", "D"];
    return labels.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const active = !!(lastActive && start && streak > 0 && d >= start && d <= lastActive);
      const isToday = d.toDateString() === now.toDateString();
      return { label, active, isToday };
    });
  }, [lastActiveDate, streak]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className={`glass rounded-3xl px-3 py-3 flex justify-between items-center ${className}`}
    >
      {weekDays.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div
            className={`w-8 h-8 rounded-full grid place-items-center text-sm transition-all ${
              d.active
                ? "bg-gradient-to-br from-brand-amber to-[#C99A33] text-white shadow-[0_5px_12px_rgba(224,184,75,0.45)]"
                : "bg-slate-100 text-slate-300"
            } ${d.isToday ? "ring-[3px] ring-brand-amber/40 ring-offset-2 ring-offset-transparent" : ""}`}
          >
            {d.active ? "🔥" : "·"}
          </div>
          <span className={`text-[11px] font-bold font-title ${d.isToday ? "text-brand-coral" : "text-slate-400"}`}>{d.label}</span>
        </div>
      ))}
    </motion.div>
  );
};
