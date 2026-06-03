"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Pair {
  left: string;
  right: string;
}

interface MatchPairsProps {
  question: string;
  pairs: Pair[];
  onSelect: (completed: boolean) => void;
  isAnswerChecked: boolean;
}

export const MatchPairs: React.FC<MatchPairsProps> = ({
  question,
  pairs,
  onSelect,
  isAnswerChecked,
}) => {
  const [leftItems, setLeftItems] = useState<string[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ [key: string]: string }>({});
  const [incorrectPair, setIncorrectPair] = useState<{ left: string; right: string } | null>(null);

  // Scramble items on mount
  useEffect(() => {
    if (!pairs || pairs.length === 0) return; // guard against empty/invalid exercise
    const lefts = pairs.map((p) => p.left);
    const rights = pairs.map((p) => p.right);
    setLeftItems([...lefts].sort(() => Math.random() - 0.5));
    setRightItems([...rights].sort(() => Math.random() - 0.5));
    setMatchedPairs({});
    setSelectedLeft(null);
    setSelectedRight(null);
    onSelect(false);
  }, [pairs, onSelect]);

  // Evaluate matches
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const correctMatch = pairs.find(
        (p) => p.left === selectedLeft && p.right === selectedRight
      );

      if (correctMatch) {
        const newMatches = { ...matchedPairs, [selectedLeft]: selectedRight };
        setMatchedPairs(newMatches);
        setSelectedLeft(null);
        setSelectedRight(null);

        // Check if all are matched
        if (Object.keys(newMatches).length === pairs.length) {
          onSelect(true);
        }
      } else {
        // Red flash for incorrect pair
        setIncorrectPair({ left: selectedLeft, right: selectedRight });
        setSelectedLeft(null);
        setSelectedRight(null);

        const timer = setTimeout(() => {
          setIncorrectPair(null);
        }, 800);

        return () => clearTimeout(timer);
      }
    }
  }, [selectedLeft, selectedRight, pairs, matchedPairs, onSelect]);

  const handleLeftClick = (item: string) => {
    if (isAnswerChecked || matchedPairs[item]) return;
    setSelectedLeft(item === selectedLeft ? null : item);
  };

  const handleRightClick = (item: string) => {
    if (isAnswerChecked || Object.values(matchedPairs).includes(item)) return;
    setSelectedRight(item === selectedRight ? null : item);
  };

  const isMatchedLeft = (item: string) => !!matchedPairs[item];
  const isMatchedRight = (item: string) => Object.values(matchedPairs).includes(item);

  return (
    <div className="flex flex-col gap-6 w-full select-none">
      <h3 className="text-xl font-bold font-title text-brand-dark mb-2 text-center">
        {question}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column (Darija) */}
        <div className="flex flex-col gap-3">
          {leftItems.map((item) => {
            const isSelected = selectedLeft === item;
            const isMatched = isMatchedLeft(item);
            const isWrong = incorrectPair?.left === item;

            let cardStyle = "bg-white border-brand-beige border-b-4 text-brand-dark hover:bg-slate-50 cursor-pointer";

            if (isMatched) {
              cardStyle = "bg-emerald-50 border-emerald-300 text-emerald-700 opacity-60 border-b-0 pointer-events-none cursor-default";
            } else if (isWrong) {
              cardStyle = "bg-rose-100 border-rose-400 text-rose-800 border-b-4 border-2 animate-shake";
            } else if (isSelected) {
              cardStyle = "bg-brand-pink/20 border-brand-coral text-brand-coral border-b-4 border-2";
            }

            return (
              <motion.div
                key={item}
                whileHover={!isMatched ? { scale: 1.02 } : {}}
                whileTap={!isMatched ? { scale: 0.98 } : {}}
                onClick={() => handleLeftClick(item)}
                className={`py-3.5 px-4 text-center font-bold rounded-2xl border-2 transition-all font-title ${cardStyle}`}
              >
                {item}
              </motion.div>
            );
          })}
        </div>

        {/* Right Column (Spanish) */}
        <div className="flex flex-col gap-3">
          {rightItems.map((item) => {
            const isSelected = selectedRight === item;
            const isMatched = isMatchedRight(item);
            const isWrong = incorrectPair?.right === item;

            let cardStyle = "bg-white border-brand-beige border-b-4 text-brand-dark hover:bg-slate-50 cursor-pointer";

            if (isMatched) {
              cardStyle = "bg-emerald-50 border-emerald-300 text-emerald-700 opacity-60 border-b-0 pointer-events-none cursor-default";
            } else if (isWrong) {
              cardStyle = "bg-rose-100 border-rose-400 text-rose-800 border-b-4 border-2 animate-shake";
            } else if (isSelected) {
              cardStyle = "bg-brand-pink/20 border-brand-coral text-brand-coral border-b-4 border-2";
            }

            return (
              <motion.div
                key={item}
                whileHover={!isMatched ? { scale: 1.02 } : {}}
                whileTap={!isMatched ? { scale: 0.98 } : {}}
                onClick={() => handleRightClick(item)}
                className={`py-3.5 px-4 text-center font-medium rounded-2xl border-2 transition-all ${cardStyle}`}
              >
                {item}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default MatchPairs;
