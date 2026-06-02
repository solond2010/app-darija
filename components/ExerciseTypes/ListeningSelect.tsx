"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, SquarePlay } from "lucide-react";
import { motion } from "framer-motion";

interface ListeningSelectProps {
  question: string;
  audioText: string; // The Darija word e.g., "Sbah l-5ir"
  options: string[];
  selectedAnswer: string | null;
  onSelect: (ans: string) => void;
  isAnswerChecked: boolean;
  correctAnswer: string;
}

export const ListeningSelect: React.FC<ListeningSelectProps> = ({
  question,
  audioText,
  options,
  selectedAnswer,
  onSelect,
  isAnswerChecked,
  correctAnswer,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    // Simulate audio playback length
    setTimeout(() => {
      setIsPlaying(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 w-full select-none">
      <h3 className="text-xl font-bold font-title text-brand-dark mb-2 text-center">
        {question}
      </h3>

      {/* Simulated Audio Player Node */}
      <div className="flex flex-col items-center justify-center gap-4 py-6 bg-white rounded-3xl border-2 border-[#FAF0DD] shadow-sm max-w-sm mx-auto w-full">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAudio}
          className={`w-20 h-20 rounded-full flex items-center justify-center border-b-4 transition-all shadow-md ${
            isPlaying
              ? "bg-brand-pink text-white border-[#D64545]"
              : "bg-brand-coral text-white border-[#D64545] hover:bg-[#FF8585]"
          }`}
        >
          <Volume2 className={`w-10 h-10 ${isPlaying ? "animate-pulse" : ""}`} />
        </motion.button>

        {/* Pulsing Audio Wave Graphic */}
        <div className="flex items-end justify-center gap-1.5 h-6">
          {[0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 0.4].map((height, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-brand-coral rounded-full"
              initial={{ height: 4 }}
              animate={isPlaying ? { height: height * 24 } : { height: 4 }}
              transition={{
                repeat: isPlaying ? Infinity : 0,
                repeatType: "reverse",
                duration: 0.5,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>

        {/* Written Transliteration block */}
        <div className="text-center px-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Transcripción</span>
          <h2 className="text-2xl font-bold text-brand-dark font-title tracking-wide mt-0.5">
            &quot;{audioText}&quot;
          </h2>
        </div>
      </div>

      {/* Multiple-choice grid options */}
      <div className="grid grid-cols-1 gap-2.5 mt-2">
        {options.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === correctAnswer;

          let btnClass = "btn-3d-secondary bg-white text-brand-dark border-[#FAF0DD] border-b-4 hover:bg-slate-50";

          if (isAnswerChecked) {
            if (isCorrect) {
              btnClass = "bg-emerald-100 border-emerald-400 text-emerald-800 border-b-4 border-2";
            } else if (isSelected) {
              btnClass = "bg-rose-100 border-rose-400 text-rose-800 border-b-4 border-2";
            } else {
              btnClass = "bg-slate-100 border-slate-200 text-slate-300 opacity-50 cursor-not-allowed";
            }
          } else if (isSelected) {
            btnClass = "bg-brand-pink/20 border-brand-coral text-brand-coral border-b-4 border-2";
          }

          return (
            <button
              key={idx}
              disabled={isAnswerChecked}
              onClick={() => onSelect(option)}
              className={`w-full py-3.5 px-6 text-left font-medium transition-all ${btnClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-brand-cream font-bold text-xs flex items-center justify-center font-title text-brand-coral flex-shrink-0">
                  {idx + 1}
                </span>
                <span>{option}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default ListeningSelect;
