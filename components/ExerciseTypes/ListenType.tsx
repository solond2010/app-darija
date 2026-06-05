"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, CheckCircle2, XCircle, Eye } from "lucide-react";
import { speak, normalizeDarija } from "../../utils/speech";
import { haptics } from "../../utils/haptics";

interface ListenTypeProps {
  question: string;
  audioText: string;
  hint?: string; // Spanish meaning, revealed on demand
  selectedAnswer: string;
  onSelect: (ans: string) => void;
  isAnswerChecked: boolean;
  correctAnswers: string[];
}

export const ListenType: React.FC<ListenTypeProps> = ({
  question,
  audioText,
  hint,
  selectedAnswer,
  onSelect,
  isAnswerChecked,
  correctAnswers,
}) => {
  const [playing, setPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const play = () => {
    haptics.tap();
    speak(audioText);
    setPlaying(true);
    setTimeout(() => setPlaying(false), 1100);
  };

  // Auto-play once when the exercise appears (best-effort; iOS may need a tap first).
  useEffect(() => {
    setShowHint(false);
    const t = setTimeout(() => speak(audioText), 350);
    return () => clearTimeout(t);
  }, [audioText]);

  const isCorrect = correctAnswers.some(
    (a) => normalizeDarija(selectedAnswer) === normalizeDarija(a)
  );

  return (
    <div className="flex flex-col gap-5 w-full select-none">
      <h3 className="text-2xl font-bold font-title text-brand-dark text-center leading-snug px-2">
        {question}
      </h3>

      {/* Big play button */}
      <div className="flex flex-col items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={play}
          aria-label="Escuchar de nuevo"
          className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-brand-saffron via-brand-coral to-brand-rose text-white glow-coral"
        >
          <Volume2 className={`w-12 h-12 ${playing ? "animate-pulse" : ""}`} />
        </motion.button>
        <span className="text-[11px] text-slate-400 font-semibold">Toca para escuchar otra vez 🔊</span>
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={isAnswerChecked}
          value={selectedAnswer}
          onChange={(e) => onSelect(e.target.value)}
          placeholder="Escribe lo que oíste…"
          className={`w-full p-4 rounded-2xl border-2 text-center text-base font-bold font-title tracking-wide focus:outline-none transition-all ${
            isAnswerChecked
              ? isCorrect
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-rose-50 border-rose-300 text-rose-800"
              : "bg-white/70 backdrop-blur-md border-white/80 focus:border-brand-coral text-brand-dark placeholder:text-slate-300 shadow-sm"
          }`}
        />
        {isAnswerChecked && (
          <div className={`absolute top-1/2 -translate-y-1/2 right-3 ${isCorrect ? "text-emerald-500" : "text-rose-400"}`}>
            {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          </div>
        )}
      </div>

      {/* Hint (Spanish meaning) */}
      {hint && !isAnswerChecked && (
        <div className="flex justify-center">
          {showHint ? (
            <span className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
              💡 Significa: <b className="text-brand-coral">{hint}</b>
            </span>
          ) : (
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold hover:text-brand-coral transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> ¿Necesitas una pista?
            </button>
          )}
        </div>
      )}

      {/* Reveal correct answer when wrong */}
      {isAnswerChecked && !isCorrect && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs leading-relaxed text-center">
          <span className="font-bold text-amber-700">Se escribía:</span>
          <span className="text-amber-700 ml-1 font-title">{correctAnswers[0]}</span>
          {hint && <span className="text-amber-600"> · {hint}</span>}
        </div>
      )}
    </div>
  );
};
export default ListenType;
