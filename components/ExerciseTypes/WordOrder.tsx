"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface WordOrderProps {
  question: string;
  words: string[];
  orderedAnswer: string[];
  translation: string;
  selectedAnswer: string[];
  onSelect: (ans: string[]) => void;
  isAnswerChecked: boolean;
}

export const WordOrder: React.FC<WordOrderProps> = ({
  question,
  words,
  orderedAnswer,
  translation,
  selectedAnswer = [],
  onSelect,
  isAnswerChecked,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  useEffect(() => {
    if (!selectedAnswer || selectedAnswer.length === 0) {
      setSelectedIndices([]);
    }
  }, [selectedAnswer, isAnswerChecked]);

  const isCorrect =
    selectedAnswer.length === orderedAnswer.length &&
    selectedAnswer.every((w, i) => w.toLowerCase() === orderedAnswer[i].toLowerCase());

  useEffect(() => {
    if (isAnswerChecked && !isCorrect) {
      setSelectedIndices([]);
      onSelect([]);
    }
  }, [isAnswerChecked, isCorrect]);

  const handleWordSelect = (word: string, index: number) => {
    if (isAnswerChecked) return;
    setSelectedIndices((prev) => [...prev, index]);
    onSelect([...(selectedAnswer || []), word]);
  };

  const handleWordRemove = (pos: number) => {
    if (isAnswerChecked) return;
    const newIndices = [...selectedIndices];
    newIndices.splice(pos, 1);
    setSelectedIndices(newIndices);
    const newAnswers = [...(selectedAnswer || [])];
    newAnswers.splice(pos, 1);
    onSelect(newAnswers);
  };

  return (
    <div className="flex flex-col gap-5 w-full select-none">
      <h3 className="text-xl font-bold font-title text-brand-dark text-center leading-snug px-2">
        {question}
      </h3>

      <p className="text-xs text-slate-400 text-center italic -mt-1">
        Significado: &quot;{translation}&quot;
      </p>

      {/* Answer board */}
      <div
        className={`w-full min-h-[72px] p-3.5 rounded-2xl border-2 flex flex-wrap gap-2 items-center justify-center transition-colors ${
          isAnswerChecked
            ? isCorrect
              ? "bg-emerald-50 border-emerald-300"
              : "bg-rose-50 border-rose-300"
            : selectedAnswer.length > 0
            ? "bg-brand-cream/60 border-brand-pink/40"
            : "bg-slate-50/80 border-brand-beige"
        }`}
      >
        {selectedAnswer.length === 0 ? (
          <span className="text-xs text-slate-400 font-medium">Toca las palabras para ordenarlas ↓</span>
        ) : (
          selectedAnswer.map((word, idx) => (
            <motion.button
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              disabled={isAnswerChecked}
              onClick={() => handleWordRemove(idx)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl font-bold font-title text-sm border-2 border-b-[3px] transition-all ${
                isAnswerChecked
                  ? isCorrect
                    ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                    : "bg-rose-100 border-rose-300 text-rose-700"
                  : "bg-gradient-to-br from-brand-saffron to-brand-coral text-white border-brand-coral/70 border-b-brand-coral active:translate-y-0.5 shadow-sm"
              }`}
            >
              {word}
              {!isAnswerChecked && <X className="w-3 h-3 opacity-70" />}
            </motion.button>
          ))
        )}
      </div>

      {/* Available words */}
      <div className="flex flex-wrap justify-center gap-2 min-h-[56px]">
        {words.map((word, idx) => {
          const isUsed = selectedIndices.includes(idx);
          return (
            <button
              key={idx}
              disabled={isUsed || isAnswerChecked}
              onClick={() => handleWordSelect(word, idx)}
              className={`py-2 px-4 rounded-xl border-2 border-b-[3px] font-bold font-title text-sm transition-all ${
                isUsed
                  ? "bg-slate-100 border-slate-100 text-transparent pointer-events-none shadow-none"
                  : "bg-white/70 backdrop-blur-md border-white/80 border-b-brand-beige text-brand-dark option-btn shadow-sm"
              }`}
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default WordOrder;
