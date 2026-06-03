"use client";

import React from "react";
import { motion } from "framer-motion";

interface FillBlankProps {
  question: string;
  sentenceWithBlank: string;
  options: string[];
  selectedAnswer: string | null;
  onSelect: (ans: string) => void;
  isAnswerChecked: boolean;
  correctAnswer: string;
}

export const FillBlank: React.FC<FillBlankProps> = ({
  question, sentenceWithBlank, options, selectedAnswer, onSelect, isAnswerChecked, correctAnswer,
}) => {
  const parts = sentenceWithBlank.split("___");
  const isCorrect = selectedAnswer === correctAnswer;

  let blankClass = "border-2 border-dashed border-brand-coral/40 text-brand-coral/40 bg-white/50 px-6 py-0.5 rounded-xl inline-block min-w-[80px] text-center";
  if (selectedAnswer) {
    if (isAnswerChecked) {
      blankClass = isCorrect
        ? "bg-emerald-100 border-2 border-emerald-300 text-emerald-700 px-4 py-0.5 rounded-xl inline-block min-w-[80px] text-center font-bold"
        : "bg-rose-100 border-2 border-rose-300 text-rose-700 px-4 py-0.5 rounded-xl inline-block min-w-[80px] text-center font-bold";
    } else {
      blankClass = "bg-gradient-to-br from-brand-saffron to-brand-coral text-white px-4 py-0.5 rounded-xl inline-block min-w-[80px] text-center font-bold glow-coral";
    }
  }

  return (
    <div className="flex flex-col gap-7 w-full select-none">
      <motion.h3 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold font-title text-brand-dark text-center leading-snug px-2">
        {question}
      </motion.h3>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-5 flex items-center justify-center min-h-[88px]"
      >
        <div className="text-xl font-bold font-title text-brand-dark flex items-center justify-center gap-2 flex-wrap leading-loose">
          <span>{parts[0]}</span>
          <span className={blankClass}>{selectedAnswer || "___"}</span>
          {parts[1] && <span>{parts[1]}</span>}
        </div>
      </motion.div>

      <div className="flex justify-center gap-3 flex-wrap">
        {options.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          let btnClass = "bg-white/70 border-white/80 border-b-brand-beige text-brand-dark backdrop-blur-md hover:bg-white/90";
          if (isAnswerChecked) {
            btnClass = "bg-white/40 border-white/50 text-slate-300 cursor-not-allowed opacity-50";
          } else if (isSelected) {
            btnClass = "bg-gradient-to-br from-brand-saffron/15 to-brand-coral/15 border-brand-coral/70 border-b-brand-coral text-brand-coral ring-2 ring-brand-coral/25";
          }
          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={isAnswerChecked ? undefined : { scale: 0.95 }}
              disabled={isAnswerChecked}
              onClick={() => onSelect(option)}
              className={`py-3 px-6 text-sm font-bold font-title rounded-2xl border-2 border-b-[3px] shadow-sm transition-colors ${btnClass}`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
export default FillBlank;
