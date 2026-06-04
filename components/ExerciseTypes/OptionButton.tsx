"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { haptics } from "../../utils/haptics";

export type OptionState = "idle" | "selected" | "correct" | "incorrect" | "dimmed";

interface OptionButtonProps {
  label: string;
  index: number;
  state: OptionState;
  disabled?: boolean;
  onClick?: () => void;
  delay?: number;
}

const SHELL: Record<OptionState, string> = {
  idle:
    "bg-white/70 border-white/80 border-b-brand-beige text-brand-dark hover:bg-white/90",
  selected:
    "bg-gradient-to-br from-brand-saffron/15 to-brand-coral/15 border-brand-coral/70 border-b-brand-coral text-brand-coral ring-2 ring-brand-coral/25",
  correct:
    "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/20 dark:to-teal-500/15 border-emerald-300 dark:border-emerald-400/40 border-b-emerald-400 text-emerald-700 ring-2 ring-emerald-300/60 dark:ring-emerald-400/25",
  incorrect:
    "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-500/20 dark:to-pink-500/15 border-rose-300 dark:border-rose-400/40 border-b-rose-400 text-rose-600 ring-2 ring-rose-300/60 dark:ring-rose-400/25",
  dimmed:
    "bg-white/40 border-white/50 text-slate-300 opacity-50",
};

const BADGE: Record<OptionState, string> = {
  idle: "bg-brand-cream text-brand-coral",
  selected: "bg-brand-coral text-white",
  correct: "bg-emerald-500 text-white",
  incorrect: "bg-rose-400 text-white",
  dimmed: "bg-slate-100 text-slate-300",
};

export const OptionButton: React.FC<OptionButtonProps> = ({
  label, index, state, disabled, onClick, delay = 0,
}) => {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 14 }}
      animate={
        state === "incorrect"
          ? { opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] }
          : state === "correct"
          ? { opacity: 1, y: 0, scale: [1, 1.04, 1] }
          : { opacity: 1, y: 0 }
      }
      transition={{ delay, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      disabled={disabled}
      onClick={() => { if (!disabled) { haptics.tap(); onClick?.(); } }}
      className={`w-full py-3.5 px-4 text-left font-semibold rounded-2xl border-2 border-b-[4px] backdrop-blur-md shadow-sm transition-colors ${SHELL[state]}`}
    >
      <div className="flex items-center gap-3">
        <span className={`w-7 h-7 rounded-xl text-xs font-bold font-title flex items-center justify-center flex-shrink-0 transition-colors ${BADGE[state]}`}>
          {state === "correct" ? <Check className="w-4 h-4 stroke-[3]" />
            : state === "incorrect" ? <X className="w-4 h-4 stroke-[3]" />
            : index + 1}
        </span>
        <span className="text-sm leading-snug">{label}</span>
      </div>
    </motion.button>
  );
};
