"use client";

import React from "react";

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
  question,
  sentenceWithBlank,
  options,
  selectedAnswer,
  onSelect,
  isAnswerChecked,
  correctAnswer,
}) => {
  const parts = sentenceWithBlank.split("___");
  const isCorrect = selectedAnswer === correctAnswer;

  let blankClass = "border-2 border-dashed border-brand-pink/60 text-brand-pink/40 bg-brand-cream/60 px-6 py-0.5 rounded-xl inline-block min-w-[80px] text-center";

  if (selectedAnswer) {
    if (isAnswerChecked) {
      blankClass = isCorrect
        ? "bg-emerald-100 border-2 border-emerald-300 text-emerald-700 px-4 py-0.5 rounded-xl inline-block min-w-[80px] text-center font-bold"
        : "bg-rose-100 border-2 border-rose-300 text-rose-700 px-4 py-0.5 rounded-xl inline-block min-w-[80px] text-center font-bold";
    } else {
      blankClass = "bg-brand-coral text-white px-4 py-0.5 rounded-xl inline-block min-w-[80px] text-center font-bold shadow-sm";
    }
  }

  return (
    <div className="flex flex-col gap-7 w-full select-none">
      <h3 className="text-xl font-bold font-title text-brand-dark text-center leading-snug px-2">
        {question}
      </h3>

      {/* Sentence display */}
      <div className="bg-white rounded-3xl p-5 border-2 border-brand-beige shadow-sm flex items-center justify-center min-h-[80px]">
        <div className="text-xl font-bold font-title text-brand-dark flex items-center justify-center gap-2 flex-wrap leading-loose">
          <span>{parts[0]}</span>
          <span className={blankClass}>{selectedAnswer || "___"}</span>
          {parts[1] && <span>{parts[1]}</span>}
        </div>
      </div>

      {/* Options */}
      <div className="flex justify-center gap-3 flex-wrap">
        {options.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          let btnClass = "bg-white border-2 border-brand-beige border-b-[3px] text-brand-dark hover:bg-slate-50";
          if (isAnswerChecked) {
            btnClass = "bg-slate-100 border-2 border-slate-100 text-slate-300 cursor-not-allowed opacity-50";
          } else if (isSelected) {
            btnClass = "bg-brand-coral/10 border-2 border-brand-coral border-b-[3px] text-brand-coral";
          }

          return (
            <button
              key={idx}
              disabled={isAnswerChecked}
              onClick={() => onSelect(option)}
              className={`option-btn py-3 px-6 text-sm font-bold font-title rounded-2xl transition-colors ${btnClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default FillBlank;
