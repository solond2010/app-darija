"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface TrueFalseProps {
  question: string;
  selectedAnswer: boolean | null;
  onSelect: (ans: boolean) => void;
  isAnswerChecked: boolean;
  correctAnswer: boolean;
}

function shell(value: boolean, selected: boolean | null, checked: boolean, correct: boolean) {
  const isSelected = selected === value;
  const isCorrect = value === correct;
  if (!checked) {
    if (isSelected) return "bg-gradient-to-br from-brand-saffron/15 to-brand-coral/15 border-brand-coral/70 border-b-brand-coral text-brand-coral ring-2 ring-brand-coral/25";
    return "bg-white/70 border-white/80 border-b-brand-beige text-brand-dark backdrop-blur-md hover:bg-white/90";
  }
  if (isCorrect) return "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 border-b-emerald-400 text-emerald-700 ring-2 ring-emerald-300/60";
  if (isSelected) return "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300 border-b-rose-400 text-rose-600 ring-2 ring-rose-300/60";
  return "bg-white/40 border-white/50 text-slate-300 opacity-50";
}

export const TrueFalse: React.FC<TrueFalseProps> = ({
  question, selectedAnswer, onSelect, isAnswerChecked, correctAnswer,
}) => {
  const Btn = ({ value, label, color }: { value: boolean; label: string; color: "emerald" | "rose" }) => (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: value ? 0.05 : 0.12 }}
      whileTap={isAnswerChecked ? undefined : { scale: 0.96 }}
      disabled={isAnswerChecked}
      onClick={() => onSelect(value)}
      className={`flex-1 py-7 px-3 rounded-3xl border-2 border-b-[5px] shadow-sm flex flex-col items-center justify-center gap-2.5 font-bold font-title text-base transition-colors ${shell(value, selectedAnswer, isAnswerChecked, correctAnswer)}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${color === "emerald" ? "from-emerald-400 to-teal-500" : "from-rose-400 to-pink-500"} text-white shadow-md`}>
        {value ? <Check className="w-8 h-8 stroke-[3]" /> : <X className="w-8 h-8 stroke-[3]" />}
      </div>
      {label}
    </motion.button>
  );

  return (
    <div className="flex flex-col gap-8 w-full select-none">
      <motion.h3 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold font-title text-brand-dark text-center leading-snug px-2">
        {question}
      </motion.h3>

      <div className="flex gap-4 w-full max-w-xs mx-auto">
        <Btn value={true} label="Verdadero" color="emerald" />
        <Btn value={false} label="Falso" color="rose" />
      </div>
    </div>
  );
};
export default TrueFalse;
