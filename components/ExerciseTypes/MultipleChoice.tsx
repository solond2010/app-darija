"use client";

import React from "react";
import { motion } from "framer-motion";
import { OptionButton, OptionState } from "./OptionButton";

interface MultipleChoiceProps {
  question: string;
  options: string[];
  selectedAnswer: string | null;
  onSelect: (ans: string) => void;
  isAnswerChecked: boolean;
  correctAnswer: string;
}

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  question, options, selectedAnswer, onSelect, isAnswerChecked, correctAnswer,
}) => {
  const stateFor = (option: string): OptionState => {
    if (!isAnswerChecked) return selectedAnswer === option ? "selected" : "idle";
    if (option === correctAnswer) return "correct";
    if (selectedAnswer === option) return "incorrect";
    return "dimmed";
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <motion.h3
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold font-title text-brand-dark text-center px-2 leading-snug"
      >
        {question}
      </motion.h3>

      <div className="grid grid-cols-1 gap-2.5">
        {options.map((option, index) => (
          <OptionButton
            key={index}
            label={option}
            index={index}
            state={stateFor(option)}
            disabled={isAnswerChecked}
            onClick={() => onSelect(option)}
            delay={index * 0.05}
          />
        ))}
      </div>
    </div>
  );
};
export default MultipleChoice;
