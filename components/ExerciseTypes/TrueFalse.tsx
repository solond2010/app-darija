"use client";

import React from "react";
import { Check, X } from "lucide-react";

interface TrueFalseProps {
  question: string;
  selectedAnswer: boolean | null;
  onSelect: (ans: boolean) => void;
  isAnswerChecked: boolean;
  correctAnswer: boolean;
}

const getButtonClass = (
  value: boolean,
  selectedAnswer: boolean | null,
  isAnswerChecked: boolean,
  correctAnswer: boolean
) => {
  const isSelected = selectedAnswer === value;
  const isCorrect = value === correctAnswer;

  if (!isAnswerChecked) {
    if (isSelected) return "bg-brand-coral/10 border-brand-coral text-brand-dark border-b-[#C94A4A] scale-[1.02]";
    return "bg-white border-brand-beige text-brand-dark hover:bg-slate-50";
  }
  if (isCorrect) return "bg-emerald-50 border-emerald-300 text-emerald-800 border-b-emerald-400";
  if (isSelected) return "bg-rose-50 border-rose-300 text-rose-800 border-b-rose-400";
  return "bg-slate-50 border-slate-100 text-slate-300 opacity-40";
};

export const TrueFalse: React.FC<TrueFalseProps> = ({
  question,
  selectedAnswer,
  onSelect,
  isAnswerChecked,
  correctAnswer,
}) => {
  return (
    <div className="flex flex-col gap-8 w-full select-none">
      <h3 className="text-xl font-bold font-title text-brand-dark text-center leading-snug px-2">
        {question}
      </h3>

      <div className="flex gap-4 w-full max-w-xs mx-auto">
        {/* Verdadero */}
        <button
          disabled={isAnswerChecked}
          onClick={() => onSelect(true)}
          className={`option-btn flex-1 py-7 px-3 rounded-3xl border-2 border-b-[5px] flex flex-col items-center justify-center gap-2.5 font-bold font-title text-base transition-all ${
            getButtonClass(true, selectedAnswer, isAnswerChecked, correctAnswer)
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isAnswerChecked && correctAnswer === true
              ? "bg-emerald-100"
              : isAnswerChecked && selectedAnswer === true
              ? "bg-rose-100"
              : "bg-emerald-50"
          }`}>
            <Check className="w-7 h-7 stroke-[2.5] text-emerald-500" />
          </div>
          Verdadero
        </button>

        {/* Falso */}
        <button
          disabled={isAnswerChecked}
          onClick={() => onSelect(false)}
          className={`option-btn flex-1 py-7 px-3 rounded-3xl border-2 border-b-[5px] flex flex-col items-center justify-center gap-2.5 font-bold font-title text-base transition-all ${
            getButtonClass(false, selectedAnswer, isAnswerChecked, correctAnswer)
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isAnswerChecked && correctAnswer === false
              ? "bg-emerald-100"
              : isAnswerChecked && selectedAnswer === false
              ? "bg-rose-100"
              : "bg-rose-50"
          }`}>
            <X className="w-7 h-7 stroke-[2.5] text-rose-400" />
          </div>
          Falso
        </button>
      </div>
    </div>
  );
};
export default TrueFalse;
