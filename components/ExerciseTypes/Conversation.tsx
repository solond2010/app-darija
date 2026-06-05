"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SpeakButton } from "../SpeakButton";

interface DialogueTurn {
  speaker: "Meshi" | "Sara";
  text: string;
  options?: string[];
  answer?: string;
}

interface ConversationProps {
  question: string;
  dialogue: DialogueTurn[];
  selectedAnswer: boolean | null;
  // null = dialogue not finished yet; true = every turn answered correctly.
  onSelect: (ans: boolean | null) => void;
  isAnswerChecked: boolean;
}

// Collect the opening lines (and any narration) up to — but not including — the
// turn at `from` that has options.
function linesUntilQuestion(dialogue: DialogueTurn[], from: number) {
  const out: DialogueTurn[] = [];
  let step = from;
  while (step < dialogue.length && !dialogue[step].options) {
    out.push(dialogue[step]);
    step++;
  }
  return { lines: out, step };
}

export const Conversation: React.FC<ConversationProps> = ({
  question,
  dialogue,
  onSelect,
  isAnswerChecked,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [chatHistory, setChatHistory] = useState<DialogueTurn[]>([]);
  const [wrongOption, setWrongOption] = useState<string | null>(null);

  // (Re)initialize whenever the dialogue changes: replay the opening lines and
  // stop at the first question. If there is no question at all, the exercise is
  // trivially complete.
  useEffect(() => {
    const { lines, step } = linesUntilQuestion(dialogue, 0);
    setChatHistory(lines);
    setCurrentStep(step);
    setWrongOption(null);
    const hasQuestion = step < dialogue.length && !!dialogue[step]?.options;
    onSelect(hasQuestion ? null : true);
  }, [dialogue, onSelect]);

  const currentTurn = dialogue[currentStep];
  const hasQuestion = !!currentTurn && !!currentTurn.options;
  const finished = !hasQuestion;

  const handlePick = (option: string) => {
    if (isAnswerChecked || !currentTurn) return;

    // A missing `answer` shouldn't soft-lock the lesson: accept any option.
    const isRight = currentTurn.answer === undefined || option === currentTurn.answer;
    if (!isRight) {
      setWrongOption(option);
      setTimeout(() => setWrongOption(null), 700);
      return;
    }

    // Correct: append Sara's line, then any of Meshi's following lines, and stop
    // at the next question.
    const { lines, step } = linesUntilQuestion(dialogue, currentStep + 1);
    setChatHistory((prev) => [...prev, { speaker: "Sara", text: option }, ...lines]);
    setCurrentStep(step);

    const moreQuestions = step < dialogue.length && !!dialogue[step]?.options;
    if (!moreQuestions) onSelect(true); // whole dialogue answered correctly
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none max-w-sm mx-auto">
      <h3 className="text-2xl font-bold font-title text-brand-dark mb-2 text-center">
        {question}
      </h3>

      {/* Chat transcript */}
      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 min-h-[200px] flex flex-col gap-3 overflow-y-auto no-scrollbar shadow-inner">
        {chatHistory.map((msg, idx) => {
          const isMeshi = msg.speaker === "Meshi";
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-2 ${!isMeshi ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                isMeshi ? "bg-brand-pink/30" : "bg-brand-mint/30"
              }`}>
                {isMeshi ? "🐱" : "👧"}
              </div>
              <div
                className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed flex items-center gap-1.5 ${
                  isMeshi
                    ? "bg-white text-brand-dark rounded-tl-none border border-brand-beige"
                    : "bg-brand-coral text-white rounded-tr-none font-medium"
                }`}
              >
                <span>{msg.text}</span>
                <SpeakButton text={msg.text} size={13} className={`p-0.5 flex-shrink-0 ${isMeshi ? "text-brand-coral/70" : "text-white/80"}`} />
              </div>
            </motion.div>
          );
        })}

        {hasQuestion && (
          <div className="flex items-center gap-1 text-slate-400 pl-12 text-xs italic">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>

      {/* Options for the current question */}
      {hasQuestion ? (
        <div className="flex flex-col gap-2 mt-2">
          {currentTurn.options?.map((option, idx) => {
            const isWrong = wrongOption === option;
            return (
              <motion.button
                key={idx}
                animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                transition={{ duration: 0.4 }}
                disabled={isAnswerChecked}
                onClick={() => handlePick(option)}
                className={`py-3 px-4 rounded-xl text-left text-xs font-semibold btn-3d transition-all ${
                  isWrong
                    ? "bg-rose-100 border-rose-400 text-rose-800 border-b-4 border-2"
                    : "bg-white border-[#FAF0DD] border-b-4 hover:bg-slate-50 text-brand-dark"
                }`}
              >
                {option}
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="mt-1 text-center text-xs font-bold font-title text-emerald-600">
          ¡Diálogo completado! 🎉 Pulsa Comprobar.
        </div>
      )}
    </div>
  );
};
export default Conversation;
