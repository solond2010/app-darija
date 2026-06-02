"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface DialogueTurn {
  speaker: "Meshi" | "Sara";
  text: string;
  options?: string[];
  answer?: string;
}

interface ConversationProps {
  question: string;
  dialogue: DialogueTurn[];
  selectedAnswer: string | null;
  onSelect: (ans: string) => void;
  isAnswerChecked: boolean;
  onAdvanceDialogue?: () => void; // Notify lesson page that we advanced internally
}

export const Conversation: React.FC<ConversationProps> = ({
  question,
  dialogue,
  selectedAnswer,
  onSelect,
  isAnswerChecked,
}) => {
  // We can display the chat logs in a message feed format
  const [currentStep, setCurrentStep] = useState(0);
  const [chatHistory, setChatHistory] = useState<DialogueTurn[]>([]);

  useEffect(() => {
    // Reset history when dialogue data changes
    setCurrentStep(0);
    // Find initial messages up to the first question
    const history: DialogueTurn[] = [];
    let step = 0;
    while (step < dialogue.length && !dialogue[step].options) {
      history.push(dialogue[step]);
      step++;
    }
    setChatHistory(history);
    setCurrentStep(step);
  }, [dialogue]);

  useEffect(() => {
    if (!isAnswerChecked || !selectedAnswer) return;
    const currentTurn = dialogue[currentStep];
    if (!currentTurn || currentTurn.answer !== selectedAnswer) return;

    // Guard: don't append if the last history entry is already Sara's answer
    const lastEntry = chatHistory[chatHistory.length - 1];
    if (lastEntry?.speaker === "Sara" && lastEntry?.text === selectedAnswer) return;

    const updatedHistory = [...chatHistory, { speaker: "Sara" as const, text: selectedAnswer }];

    // Also queue Meshi's next lines until next question
    let nextStep = currentStep + 1;
    while (nextStep < dialogue.length && !dialogue[nextStep].options) {
      updatedHistory.push(dialogue[nextStep]);
      nextStep++;
    }

    setChatHistory(updatedHistory);
    setCurrentStep(nextStep);
  }, [isAnswerChecked, selectedAnswer]);

  const currentTurn = dialogue[currentStep];
  const hasQuestion = currentTurn && currentTurn.options;

  return (
    <div className="flex flex-col gap-4 w-full select-none max-w-sm mx-auto">
      <h3 className="text-xl font-bold font-title text-brand-dark mb-2 text-center">
        {question}
      </h3>

      {/* Chat Transcript Area */}
      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 min-h-[200px] flex flex-col gap-3 overflow-y-auto no-scrollbar shadow-inner">
        {chatHistory.map((msg, idx) => {
          const isSuki = msg.speaker === "Meshi";
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-2 ${!isSuki ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                isSuki ? "bg-brand-pink/30" : "bg-brand-mint/30"
              }`}>
                {isSuki ? "🐱" : "👧"}
              </div>

              {/* Message bubble */}
              <div
                className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                  isSuki
                    ? "bg-white text-brand-dark rounded-tl-none border border-brand-beige"
                    : "bg-brand-coral text-white rounded-tr-none font-medium"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          );
        })}

        {/* Current question indicator (animated thinking bubble for Suki) */}
        {hasQuestion && !isAnswerChecked && !selectedAnswer && (
          <div className="flex items-center gap-1 text-slate-400 pl-12 text-xs italic">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>

      {/* Answer options */}
      {hasQuestion && (
        <div className="flex flex-col gap-2 mt-2">
          {currentTurn.options?.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentTurn.answer;

            let btnClass = "bg-white border-[#FAF0DD] border-b-4 hover:bg-slate-50 text-brand-dark";

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
                className={`py-3 px-4 rounded-xl text-left text-xs font-semibold btn-3d transition-all ${btnClass}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Conversation;
