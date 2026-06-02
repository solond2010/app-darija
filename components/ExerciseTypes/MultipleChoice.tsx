"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface MultipleChoiceProps {
  question: string;
  options: string[];
  selectedAnswer: string | null;
  onSelect: (ans: string) => void;
  isAnswerChecked: boolean;
  correctAnswer: string;
}

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  question,
  options,
  selectedAnswer,
  onSelect,
  isAnswerChecked,
  correctAnswer,
}) => {
  return (
    <div className="flex flex-col gap-5 w-full">
      <h3 className="text-xl font-bold font-title text-brand-dark text-center px-2 leading-snug">
        {question}
      </h3>

      <div className="grid grid-cols-1 gap-2.5">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === correctAnswer;

          let containerClass = "bg-white border-2 border-brand-beige border-b-[4px] text-brand-dark";
          let numberClass = "bg-brand-cream text-brand-coral";

          if (isAnswerChecked) {
            if (isCorrect) {
              containerClass = "bg-emerald-50 border-2 border-emerald-300 border-b-[4px] border-b-emerald-400 text-emerald-800";
              numberClass = "bg-emerald-100 text-emerald-600";
            } else if (isSelected) {
              containerClass = "bg-rose-50 border-2 border-rose-300 border-b-[4px] border-b-rose-400 text-rose-800";
              numberClass = "bg-rose-100 text-rose-500";
            } else {
              containerClass = "bg-slate-50 border-2 border-slate-100 text-slate-300 opacity-50 cursor-not-allowed";
              numberClass = "bg-slate-100 text-slate-300";
            }
          } else if (isSelected) {
            containerClass = "bg-brand-coral/8 border-2 border-brand-coral border-b-[4px] border-b-[#C94A4A] text-brand-coral";
            numberClass = "bg-brand-coral/15 text-brand-coral";
          }

          return (
            <button
              key={index}
              disabled={isAnswerChecked}
              onClick={() => onSelect(option)}
              className={`option-btn w-full py-3.5 px-4 text-left font-semibold rounded-2xl transition-colors ${containerClass}`}
            >
              <div className="flex items-center gap-3">
                {isAnswerChecked ? (
                  isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  ) : (
                    <span className={`w-6 h-6 rounded-lg text-[11px] font-bold font-title flex items-center justify-center flex-shrink-0 ${numberClass}`}>
                      {index + 1}
                    </span>
                  )
                ) : (
                  <span className={`w-6 h-6 rounded-lg text-[11px] font-bold font-title flex items-center justify-center flex-shrink-0 ${numberClass}`}>
                    {index + 1}
                  </span>
                )}
                <span className="text-sm leading-snug">{option}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default MultipleChoice;
