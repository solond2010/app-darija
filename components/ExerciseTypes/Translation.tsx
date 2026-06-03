"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface TranslationProps {
  question: string;
  selectedAnswer: string;
  onSelect: (ans: string) => void;
  isAnswerChecked: boolean;
  correctAnswers: string[];
}

export const Translation: React.FC<TranslationProps> = ({
  question,
  selectedAnswer,
  onSelect,
  isAnswerChecked,
  correctAnswers,
}) => {
  const normalize = (str: string) =>
    str.toLowerCase().trim()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡]/g, "");

  const isCorrect = correctAnswers.some((a) => normalize(selectedAnswer) === normalize(a));

  return (
    <div className="flex flex-col gap-5 w-full">
      <h3 className="text-xl font-bold font-title text-brand-dark text-center leading-snug px-2">
        {question}
      </h3>

      <div className="relative">
        <textarea
          disabled={isAnswerChecked}
          value={selectedAnswer}
          onChange={(e) => onSelect(e.target.value)}
          placeholder="Escribe tu traducción aquí..."
          rows={3}
          className={`w-full p-4 rounded-2xl border-2 resize-none focus:outline-none transition-all text-sm font-semibold leading-relaxed ${
            isAnswerChecked
              ? isCorrect
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-rose-50 border-rose-300 text-rose-800"
              : "bg-white/70 backdrop-blur-md border-white/80 focus:border-brand-coral text-brand-dark placeholder:text-slate-300 shadow-sm"
          }`}
        />
        {isAnswerChecked && (
          <div className={`absolute top-3 right-3 ${isCorrect ? "text-emerald-500" : "text-rose-400"}`}>
            {isCorrect
              ? <CheckCircle2 className="w-5 h-5" />
              : <XCircle className="w-5 h-5" />
            }
          </div>
        )}
      </div>

      {isAnswerChecked && !isCorrect && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs leading-relaxed">
          <span className="font-bold text-amber-700">Traducción aceptada:</span>
          <span className="text-amber-700 ml-1">{correctAnswers[0]}</span>
        </div>
      )}
    </div>
  );
};
export default Translation;
