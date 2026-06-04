"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";

interface FlashcardProps {
  question: string;
  front: string;
  back: string;
  hint?: string;
  selectedAnswer: boolean | null;
  onSelect: (ans: boolean) => void;
  isAnswerChecked: boolean;
  onFlip?: (flipped: boolean) => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  question,
  front,
  back,
  hint,
  selectedAnswer,
  onSelect,
  isAnswerChecked,
  onFlip,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
    onFlip?.(false);
  }, [front]);

  const handleFlip = () => {
    if (isAnswerChecked) return;
    const next = !isFlipped;
    setIsFlipped(next);
    onFlip?.(next);
  };

  return (
    <div className="flex flex-col gap-5 w-full select-none max-w-sm mx-auto items-center">
      <h3 className="text-2xl font-bold font-title text-brand-dark text-center leading-snug px-2">
        {question}
      </h3>

      {/* 3D Flip Card */}
      <div onClick={handleFlip} className="w-full h-56 perspective-1000 cursor-pointer">
        <div
          className={`w-full h-full duration-500 transform-style-3d relative rounded-3xl shadow-md bg-white ${
            isAnswerChecked
              ? selectedAnswer === true
                ? "border-2 border-emerald-300 border-b-[5px] border-b-emerald-400"
                : "border-2 border-rose-300 border-b-[5px] border-b-rose-400"
              : "border-2 border-brand-beige border-b-[5px] border-b-[#E0D5C0]"
          } ${isFlipped ? "rotate-y-180" : ""}`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-6 text-center rounded-3xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-coral bg-brand-pink/20 px-3 py-1 rounded-full mb-4">
              Darija (Chat)
            </span>
            <h2 className="text-3xl font-bold font-title text-brand-dark">{front}</h2>
            {hint && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-4 bg-slate-50 px-3 py-1.5 rounded-full">
                <HelpCircle className="w-3 h-3" />
                <span>Pista: {hint}</span>
              </div>
            )}
            <p className="text-[10px] text-slate-400 mt-5 animate-pulse">Haz clic para ver la traducción 🔄</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 text-center bg-brand-mint/10 rounded-3xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#1A5C4A] bg-brand-mint/30 px-3 py-1 rounded-full mb-4">
              Traducción Español
            </span>
            <h2 className="text-2xl font-bold text-brand-dark">{back}</h2>
            <p className="text-[10px] text-slate-400 mt-6">Haz clic para volver 🔄</p>
          </div>
        </div>
      </div>

      {/* Result after check */}
      {isAnswerChecked && selectedAnswer !== null && (
        <div className={`w-full py-2.5 px-4 rounded-2xl text-center text-sm font-bold font-title animate-pop-in ${
          selectedAnswer === true
            ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
            : "bg-amber-50 text-amber-700 border-2 border-amber-200"
        }`}>
          {selectedAnswer === true ? "¡Lo sabías! 🎉" : "Sigue practicando 🔄"}
        </div>
      )}
    </div>
  );
};
export default Flashcard;
