"use client";

import React, { useState } from "react";
import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { OptionButton, OptionState } from "./OptionButton";
import { speak } from "../../utils/speech";
import { haptics } from "../../utils/haptics";

interface ListeningSelectProps {
  question: string;
  audioText: string;
  options: string[];
  selectedAnswer: string | null;
  onSelect: (ans: string) => void;
  isAnswerChecked: boolean;
  correctAnswer: string;
}

export const ListeningSelect: React.FC<ListeningSelectProps> = ({
  question, audioText, options, selectedAnswer, onSelect, isAnswerChecked, correctAnswer,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    haptics.tap();
    speak(audioText); // actually pronounce the word now
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 1200);
  };

  // Auto-play once when the exercise appears, so it feels like a real listening task.
  React.useEffect(() => {
    const t = setTimeout(() => speak(audioText), 350);
    return () => clearTimeout(t);
  }, [audioText]);

  const stateFor = (option: string): OptionState => {
    if (!isAnswerChecked) return selectedAnswer === option ? "selected" : "idle";
    if (option === correctAnswer) return "correct";
    if (selectedAnswer === option) return "incorrect";
    return "dimmed";
  };

  return (
    <div className="flex flex-col gap-6 w-full select-none">
      <motion.h3 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold font-title text-brand-dark text-center">
        {question}
      </motion.h3>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="glass flex flex-col items-center justify-center gap-4 py-6 rounded-3xl max-w-sm mx-auto w-full"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAudio}
          className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-brand-saffron via-brand-coral to-brand-rose text-white glow-coral"
        >
          <Volume2 className={`w-10 h-10 ${isPlaying ? "animate-pulse" : ""}`} />
        </motion.button>

        <div className="flex items-end justify-center gap-1.5 h-6">
          {[0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 0.4].map((height, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-gradient-to-t from-brand-coral to-brand-rose rounded-full"
              initial={{ height: 4 }}
              animate={isPlaying ? { height: height * 24 } : { height: 4 }}
              transition={{ repeat: isPlaying ? Infinity : 0, repeatType: "reverse", duration: 0.5, delay: i * 0.05 }}
            />
          ))}
        </div>

        <div className="text-center px-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Transcripción</span>
          <h2 className="text-2xl font-bold text-brand-dark font-title tracking-wide mt-0.5">&quot;{audioText}&quot;</h2>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-2.5">
        {options.map((option, idx) => (
          <OptionButton
            key={idx}
            label={option}
            index={idx}
            state={stateFor(option)}
            disabled={isAnswerChecked}
            onClick={() => onSelect(option)}
            delay={idx * 0.05}
          />
        ))}
      </div>
    </div>
  );
};
export default ListeningSelect;
