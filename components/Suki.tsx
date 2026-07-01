"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type MeshiMood =
  | "normal"
  | "celebrating"
  | "cheering"
  | "sad"
  | "sleeping"
  | "perfect"
  | "thinking";

interface MeshiProps {
  mood: MeshiMood;
  size?: number;
  showBubble?: boolean;
  bubbleText?: string;
  className?: string;
  interactive?: boolean;
}

// ── Silhouette palette ──
const BG = "#0E0E0E";       // black badge background (also the "cut-out" eyes)
const OLIVE = "#8DA24F";    // olive-green cat silhouette
const RING = "#6B7A3F";     // subtle olive ring around the badge

export const Meshi: React.FC<MeshiProps> = ({
  mood,
  size = 180,
  showBubble = false,
  bubbleText = "",
  className = "",
  interactive = true,
}) => {
  const [isPetted, setIsPetted] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [displayedText, setDisplayedText] = useState("");
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartIdRef = useRef(0);

  // Typewriter effect — restarts whenever bubbleText changes
  useEffect(() => {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    if (!bubbleText) { setDisplayedText(""); return; }
    setDisplayedText("");
    let i = 0;
    typeTimerRef.current = setInterval(() => {
      i++;
      setDisplayedText(bubbleText.slice(0, i));
      if (i >= bubbleText.length && typeTimerRef.current) clearInterval(typeTimerRef.current);
    }, 18);
    return () => { if (typeTimerRef.current) clearInterval(typeTimerRef.current); };
  }, [bubbleText]);

  const handlePet = () => {
    if (!interactive) return;
    setIsPetted(true);
    setTimeout(() => setIsPetted(false), 450);
    const newHearts = [0, 1, 2].map(() => ({
      id: heartIdRef.current++,
      x: 20 + Math.random() * 60,
    }));
    setHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.find((n) => n.id === h.id)));
    }, 1600);
  };

  // Idle animation varies by mood, but the silhouette stays the same.
  const bob =
    mood === "celebrating" || mood === "perfect"
      ? { y: [0, -12, 0], rotate: [0, 4, -4, 0], transition: { repeat: Infinity, duration: 0.75, ease: "easeInOut" } }
      : mood === "cheering"
      ? { y: [0, -8, 0], transition: { repeat: Infinity, duration: 1.1, ease: "easeInOut" } }
      : mood === "sad"
      ? { y: [0, 4, 0], transition: { repeat: Infinity, duration: 2.8, ease: "easeInOut" } }
      : mood === "sleeping"
      ? { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 3.4, ease: "easeInOut" } }
      : { y: [0, -5, 0], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } };

  // Eyes adapt to the mood (drawn in the black background colour so they read
  // as cut-outs in the olive face).
  const eyes = (() => {
    if (mood === "sleeping" || mood === "sad") {
      return (
        <g stroke={BG} strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 66 63 Q 71 67 76 63" />
          <path d="M 84 63 Q 89 67 94 63" />
        </g>
      );
    }
    if (mood === "celebrating" || mood === "perfect" || mood === "cheering") {
      return (
        <g stroke={BG} strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 66 63 Q 71 57 76 63" />
          <path d="M 84 63 Q 89 57 94 63" />
        </g>
      );
    }
    // normal / thinking — round open eyes
    return (
      <g fill={BG}>
        <ellipse cx="71" cy="62" rx="3.6" ry="4.6" />
        <ellipse cx="89" cy="62" rx="3.6" ry="4.6" />
      </g>
    );
  })();

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Cat silhouette badge with pet interaction */}
      <motion.div
        className="relative flex-shrink-0"
        style={{ width: size, height: size }}
        animate={isPetted ? { scale: [1, 1.12, 0.95, 1.05, 1], rotate: [0, -6, 6, -3, 0] } : { scale: 1 }}
        transition={{ duration: 0.45 }}
        onClick={handlePet}
        role={interactive ? "button" : undefined}
        aria-label={interactive ? "Acariciar a Meshi" : undefined}
      >
        <svg viewBox="0 0 160 160" width="100%" height="100%">
          {/* Black round badge background */}
          <circle cx="80" cy="80" r="78" fill={BG} />
          <circle cx="80" cy="80" r="76.5" fill="none" stroke={RING} strokeWidth="2" opacity="0.35" />

          {/* Olive cat silhouette */}
          <motion.g animate={bob as import("framer-motion").TargetAndTransition}>
            <g fill={OLIVE} stroke={OLIVE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
              {/* Ears */}
              <path d="M 58 50 L 47 22 L 82 44 Z" />
              <path d="M 102 50 L 113 22 L 78 44 Z" />
              {/* Head */}
              <circle cx="80" cy="64" r="26" />
              {/* Body */}
              <path d="M 55 82 C 49 112 55 138 64 143 L 96 143 C 105 138 111 112 105 82 Z" />
              {/* Tail curling on the right */}
              <path d="M 103 134 C 141 136 143 98 121 92 C 133 101 127 120 103 119 Z" />
            </g>
            {/* Face cut-outs */}
            {eyes}
            <polygon points="80,72 76,69 84,69" fill={BG} />

            {mood === "sleeping" && (
              <motion.text
                x="112" y="46" fontSize="15" fontWeight="bold" fill={OLIVE}
                animate={{ opacity: [0, 1, 0], y: [46, 30, 14], scale: [0.7, 1.1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2.8 }}
                style={{ fontFamily: "var(--font-fredoka)" }}
              >Zzz</motion.text>
            )}
          </motion.g>
        </svg>

        {/* Floating hearts on pet */}
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              className="absolute pointer-events-none text-base"
              style={{ left: h.x, bottom: "70%" }}
              initial={{ opacity: 1, y: 0, scale: 0.6 }}
              animate={{ opacity: 0, y: -55, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              🤍
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Speech bubble with typewriter text */}
      {showBubble && bubbleText && (
        <motion.div
          key={bubbleText}
          initial={{ opacity: 0, scale: 0.85, x: -8 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative flex-1 min-w-0 bg-white text-brand-dark p-3 rounded-2xl shadow-md border-2 border-brand-beige font-medium text-sm leading-relaxed"
        >
          {/* Bubble tail */}
          <div className="absolute left-0 top-1/2 -translate-x-[9px] -translate-y-1/2 w-4 h-4 bg-white border-l-2 border-b-2 border-brand-beige rotate-45" />
          <p className="break-words">
            {displayedText}
            {displayedText.length < bubbleText.length && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="inline-block w-0.5 h-3.5 bg-brand-coral ml-0.5 align-middle"
              />
            )}
          </p>
        </motion.div>
      )}
    </div>
  );
};
