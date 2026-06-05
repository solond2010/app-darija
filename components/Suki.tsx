"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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

const BLINK_POSITIONS: Record<string, { cx: number; cy: number; rx: number }[]> = {
  default: [
    { cx: 50, cy: 58, rx: 10 },
    { cx: 95, cy: 58, rx: 10 },
  ],
};

export const Meshi: React.FC<MeshiProps> = ({
  mood,
  size = 180,
  showBubble = false,
  bubbleText = "",
  className = "",
  interactive = true,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPetted, setIsPetted] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [displayedText, setDisplayedText] = useState("");
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Random blink scheduler
  const scheduleBlink = useCallback(() => {
    const delay = 2800 + Math.random() * 3500;
    blinkTimerRef.current = setTimeout(() => {
      if (mood !== "sleeping" && mood !== "perfect") {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 130);
      } else {
        scheduleBlink();
      }
    }, delay);
  }, [mood]);

  useEffect(() => {
    scheduleBlink();
    return () => { if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current); };
  }, [scheduleBlink]);

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

  // Tail wagging — varies by mood
  const tailAnim =
    mood === "celebrating" || mood === "perfect"
      ? { rotate: [-22, 22, -22], transition: { repeat: Infinity, duration: 0.35 } }
      : mood === "cheering"
      ? { rotate: [-14, 14, -14], transition: { repeat: Infinity, duration: 0.7 } }
      : mood === "sad"
      ? { rotate: [-4, 2, -4], transition: { repeat: Infinity, duration: 3.5 } }
      : mood === "sleeping"
      ? { rotate: 0 }
      : mood === "thinking"
      ? { rotate: [-6, 6, -6], transition: { repeat: Infinity, duration: 2.2 } }
      : { rotate: [-9, 9, -9], transition: { repeat: Infinity, duration: 1.1 } };

  // Blink overlay (covers eyes with closed arcs)
  const blinkOverlay = isBlinking ? (
    <g>
      <ellipse cx="50" cy="58" rx="11" ry="5" fill="#FAF0DD" />
      <ellipse cx="95" cy="58" rx="11" ry="5" fill="#FAF0DD" />
      <path d="M 40 58 Q 50 64 60 58" fill="none" stroke="#2D3748" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 85 58 Q 95 64 105 58" fill="none" stroke="#2D3748" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  ) : null;

  const renderCat = () => {
    switch (mood) {
      case "celebrating":
        return (
          <motion.g
            animate={{ y: [0, -16, 0], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.75 }}
          >
            {/* Fez */}
            <path d="M 65 15 L 85 15 L 90 35 L 60 35 Z" fill="#FF6B6B" stroke="#2D3748" strokeWidth="3" />
            <path d="M 75 15 L 75 10 L 85 18" fill="none" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="85" cy="18" r="2" fill="#2D3748" />
            {/* Sparkles on fez */}
            <motion.text x="52" y="18" fontSize="10" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>✨</motion.text>

            {/* Ears */}
            <path d="M 35 45 L 20 20 L 50 35 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <path d="M 38 42 L 27 25 L 47 34 Z" fill="#FFB4B4" />
            <path d="M 115 45 L 130 20 L 100 35 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <path d="M 112 42 L 123 25 L 103 34 Z" fill="#FFB4B4" />

            {/* Head */}
            <ellipse cx="75" cy="65" rx="45" ry="32" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <ellipse cx="48" cy="72" rx="7" ry="4" fill="#FFB4B4" opacity="0.8" />
            <ellipse cx="102" cy="72" rx="7" ry="4" fill="#FFB4B4" opacity="0.8" />

            {/* Eyes (Happy ^ ^) */}
            <path d="M 45 60 Q 52 50 60 60" fill="none" stroke="#2D3748" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 90 60 Q 98 50 106 60" fill="none" stroke="#2D3748" strokeWidth="3.5" strokeLinecap="round" />
            {blinkOverlay}

            {/* Nose & Mouth */}
            <polygon points="75,66 72,62 78,62" fill="#FF6B6B" />
            <path d="M 75 66 Q 71 70 67 68 Q 63 70 67 76 Q 75 80 83 76 Q 87 70 83 68 Q 79 70 75 66 Z" fill="#D64545" stroke="#2D3748" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Whiskers */}
            <line x1="28" y1="65" x2="12" y2="63" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="28" y1="71" x2="14" y2="73" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="122" y1="65" x2="138" y2="63" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="122" y1="71" x2="136" y2="73" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />

            {/* Body */}
            <path d="M 45 92 Q 40 120 40 135 L 110 135 Q 110 120 105 92 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <ellipse cx="40" cy="98" rx="8" ry="12" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" transform="rotate(-30 40 98)" />
            <ellipse cx="110" cy="98" rx="8" ry="12" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" transform="rotate(30 110 98)" />
          </motion.g>
        );

      case "sad":
        return (
          <motion.g
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            <g transform="rotate(-8 75 25)">
              <path d="M 65 15 L 85 15 L 90 35 L 60 35 Z" fill="#FF6B6B" stroke="#2D3748" strokeWidth="3" />
              <path d="M 75 15 L 75 10 L 85 18" fill="none" stroke="#2D3748" strokeWidth="2.5" />
            </g>
            <path d="M 35 48 L 15 32 L 48 38 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <path d="M 38 45 L 22 34 L 45 38 Z" fill="#FFB4B4" />
            <path d="M 115 48 L 135 32 L 102 38 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <path d="M 112 45 L 128 34 L 105 38 Z" fill="#FFB4B4" />

            <ellipse cx="75" cy="65" rx="45" ry="32" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />

            {/* Sad eyes */}
            <path d="M 47 55 Q 53 63 60 56" fill="none" stroke="#2D3748" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 90 56 Q 97 63 103 55" fill="none" stroke="#2D3748" strokeWidth="3.5" strokeLinecap="round" />
            {blinkOverlay}

            {/* Animated tear */}
            <motion.path
              d="M 48 65 Q 48 76 52 76 Q 56 76 52 65 Z"
              fill="#64B5F6"
              animate={{ y: [0, 4, 8], opacity: [1, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeIn" }}
            />

            <polygon points="75,66 72,62 78,62" fill="#FF6B6B" />
            <path d="M 70 75 Q 75 70 80 75" fill="none" stroke="#2D3748" strokeWidth="3" strokeLinecap="round" />

            <line x1="28" y1="67" x2="13" y2="70" stroke="#2D3748" strokeWidth="2.5" />
            <line x1="28" y1="73" x2="15" y2="78" stroke="#2D3748" strokeWidth="2.5" />
            <line x1="122" y1="67" x2="137" y2="70" stroke="#2D3748" strokeWidth="2.5" />
            <line x1="122" y1="73" x2="115" y2="78" stroke="#2D3748" strokeWidth="2.5" />

            <path d="M 45 92 Q 40 120 40 135 L 110 135 Q 110 120 105 92 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
          </motion.g>
        );

      case "sleeping":
        return (
          <motion.g
            animate={{ scaleY: [1, 0.97, 1] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          >
            <path d="M 65 15 L 85 15 L 90 35 L 60 35 Z" fill="#FF6B6B" stroke="#2D3748" strokeWidth="3" />
            <path d="M 75 15 L 75 10 L 85 18" fill="none" stroke="#2D3748" strokeWidth="2.5" />
            <path d="M 35 45 L 20 20 L 50 35 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <path d="M 115 45 L 130 20 L 100 35 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />

            <ellipse cx="75" cy="65" rx="45" ry="32" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />

            {/* Sleeping eyes (—) */}
            <line x1="43" y1="58" x2="58" y2="58" stroke="#2D3748" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="91" y1="58" x2="106" y2="58" stroke="#2D3748" strokeWidth="3.5" strokeLinecap="round" />

            <polygon points="75,64 73,61 77,61" fill="#FF6B6B" />
            <circle cx="75" cy="72" r="4.5" fill="none" stroke="#2D3748" strokeWidth="2.5" />

            <line x1="28" y1="65" x2="13" y2="65" stroke="#2D3748" strokeWidth="2" />
            <line x1="122" y1="65" x2="137" y2="65" stroke="#2D3748" strokeWidth="2" />

            {/* Zzz floating */}
            <motion.text x="112" y="38" fontSize="13" fontWeight="bold" fill="#FF6B6B"
              animate={{ opacity: [0, 1, 0], y: [38, 22, 8], scale: [0.7, 1.1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2.8 }}
              style={{ fontFamily: "var(--font-fredoka)" }}
            >Zzz</motion.text>

            <path d="M 45 92 Q 40 120 40 135 L 110 135 Q 110 120 105 92 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
          </motion.g>
        );

      case "perfect":
        return (
          <motion.g
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          >
            {/* Crown */}
            <path d="M 50 18 L 60 5 L 75 13 L 90 5 L 100 18 Z" fill="#FFD700" stroke="#2D3748" strokeWidth="2" />
            <path d="M 65 15 L 85 15 L 90 35 L 60 35 Z" fill="#FF6B6B" stroke="#2D3748" strokeWidth="3" />
            <path d="M 75 15 L 75 10 L 85 18" fill="none" stroke="#2D3748" strokeWidth="2.5" />

            <path d="M 35 45 L 20 20 L 50 35 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <path d="M 115 45 L 130 20 L 100 35 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />

            <ellipse cx="75" cy="65" rx="45" ry="32" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <ellipse cx="48" cy="72" rx="7" ry="4" fill="#FFB4B4" opacity="0.8" />
            <ellipse cx="102" cy="72" rx="7" ry="4" fill="#FFB4B4" opacity="0.8" />

            {/* Star eyes */}
            <polygon points="52,48 55,54 61,55 56,59 58,65 52,62 46,65 48,59 43,55 49,54" fill="#FFD700" stroke="#2D3748" strokeWidth="2" />
            <polygon points="98,48 101,54 107,55 102,59 104,65 98,62 92,65 94,59 89,55 95,54" fill="#FFD700" stroke="#2D3748" strokeWidth="2" />

            <polygon points="75,66 72,62 78,62" fill="#FF6B6B" />
            <path d="M 68 70 Q 75 78 82 70" fill="none" stroke="#2D3748" strokeWidth="3.5" strokeLinecap="round" />

            <line x1="28" y1="65" x2="13" y2="63" stroke="#2D3748" strokeWidth="2.5" />
            <line x1="28" y1="71" x2="15" y2="73" stroke="#2D3748" strokeWidth="2.5" />
            <line x1="122" y1="65" x2="137" y2="63" stroke="#2D3748" strokeWidth="2.5" />
            <line x1="122" y1="71" x2="135" y2="73" stroke="#2D3748" strokeWidth="2.5" />

            <path d="M 45 92 Q 40 120 40 135 L 110 135 Q 110 120 105 92 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
          </motion.g>
        );

      case "thinking":
        return (
          <motion.g
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <path d="M 65 15 L 85 15 L 90 35 L 60 35 Z" fill="#FF6B6B" stroke="#2D3748" strokeWidth="3" />
            <path d="M 75 15 L 75 10 L 85 18" fill="none" stroke="#2D3748" strokeWidth="2.5" />

            <path d="M 35 45 L 20 20 L 50 35 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <path d="M 115 45 L 130 20 L 100 35 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />

            <ellipse cx="75" cy="65" rx="45" ry="32" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />

            {/* Thinking eyes (glancing up-right) */}
            <circle cx="50" cy="58" r="8" fill="#2D3748" />
            <circle cx="95" cy="58" r="8" fill="#2D3748" />
            <circle cx="53" cy="55" r="3.5" fill="white" />
            <circle cx="98" cy="55" r="3.5" fill="white" />
            {blinkOverlay}

            <polygon points="75,66 72,62 78,62" fill="#FF6B6B" />
            <path d="M 70 71 Q 74 74 78 71" fill="none" stroke="#2D3748" strokeWidth="3" strokeLinecap="round" />

            <line x1="28" y1="65" x2="13" y2="63" stroke="#2D3748" strokeWidth="2" />
            <line x1="122" y1="65" x2="137" y2="63" stroke="#2D3748" strokeWidth="2" />

            {/* Thinking bubbles */}
            <motion.circle cx="135" cy="45" r="4" fill="#E8D5FF" stroke="#2D3748" strokeWidth="1.5"
              animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1.5 }} />
            <motion.circle cx="145" cy="33" r="7" fill="#E8D5FF" stroke="#2D3748" strokeWidth="2"
              animate={{ scale: [1, 0.8, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} />
            <motion.text x="142" y="37" fontSize="12" fontWeight="bold" fill="#2D3748"
              style={{ fontFamily: "var(--font-fredoka)" }}>?</motion.text>

            <path d="M 45 92 Q 40 120 40 135 L 110 135 Q 110 120 105 92 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <ellipse cx="65" cy="98" rx="8" ry="10" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" transform="rotate(-40 65 98)" />
          </motion.g>
        );

      case "cheering":
      case "normal":
      default:
        return (
          <motion.g
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <path d="M 65 15 L 85 15 L 90 35 L 60 35 Z" fill="#FF6B6B" stroke="#2D3748" strokeWidth="3" />
            <path d="M 75 15 L 75 10 L 85 18" fill="none" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="85" cy="18" r="2" fill="#2D3748" />

            <path d="M 35 45 L 20 20 L 50 35 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <path d="M 38 42 L 27 25 L 47 34 Z" fill="#FFB4B4" />
            <path d="M 115 45 L 130 20 L 100 35 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <path d="M 112 42 L 123 25 L 103 34 Z" fill="#FFB4B4" />

            <ellipse cx="75" cy="65" rx="45" ry="32" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <ellipse cx="48" cy="72" rx="7" ry="4" fill="#FFB4B4" opacity="0.6" />
            <ellipse cx="102" cy="72" rx="7" ry="4" fill="#FFB4B4" opacity="0.6" />

            {/* Eyes */}
            <circle cx="50" cy="58" r="8" fill="#2D3748" />
            <circle cx="95" cy="58" r="8" fill="#2D3748" />
            <circle cx="48" cy="55" r="2.5" fill="white" />
            <circle cx="93" cy="55" r="2.5" fill="white" />

            {/* Wink if cheering */}
            {mood === "cheering" && (
              <g>
                <circle cx="95" cy="58" r="9" fill="#FAF0DD" />
                <path d="M 88 58 Q 95 65 102 58" fill="none" stroke="#2D3748" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            )}
            {blinkOverlay}

            <polygon points="75,66 72,62 78,62" fill="#FF6B6B" />
            <path d="M 75 66 Q 71 70 67 67 Q 63 64 67 67 Q 71 70 75 66 Q 79 70 83 67 Q 87 64 83 67 Q 79 70 75 66 Z" fill="none" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />

            <line x1="28" y1="65" x2="13" y2="62" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="71" x2="15" y2="72" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
            <line x1="122" y1="65" x2="137" y2="62" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
            <line x1="122" y1="71" x2="135" y2="72" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />

            <path d="M 45 92 Q 40 120 40 135 L 110 135 Q 110 120 105 92 Z" fill="#FAF0DD" stroke="#2D3748" strokeWidth="3" />
            <ellipse cx="48" cy="98" rx="6" ry="10" fill="#FAF0DD" stroke="#2D3748" strokeWidth="2.5" transform="rotate(-15 48 98)" />
            <ellipse cx="102" cy="98" rx="6" ry="10" fill="#FAF0DD" stroke="#2D3748" strokeWidth="2.5" transform="rotate(15 102 98)" />
          </motion.g>
        );
    }
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Cat SVG wrapper with click/pet interaction */}
      <motion.div
        className="relative flex-shrink-0"
        style={{ width: size, height: size }}
        animate={isPetted ? { scale: [1, 1.12, 0.95, 1.05, 1], rotate: [0, -6, 6, -3, 0] } : { scale: 1 }}
        transition={{ duration: 0.45 }}
        onClick={handlePet}
        role={interactive ? "button" : undefined}
        aria-label={interactive ? "Acariciar a Meshi" : undefined}
      >
        <svg viewBox="0 0 160 150" width="100%" height="100%" style={{ overflow: "visible" }}>
          {renderCat()}

          {/* Tail — always visible, wags based on mood */}
          <motion.g
            style={{ transformOrigin: "108px 128px" }}
            animate={tailAnim}
          >
            <path
              d="M 108 128 C 130 118 148 108 152 92 C 155 80 145 74 138 78"
              fill="none"
              stroke="#2D3748"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 108 128 C 129 119 146 109 150 93 C 153 81 143 75 136 79"
              fill="#FAF0DD"
              strokeWidth="0"
            />
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
          className="relative flex-1 min-w-0 bg-white text-brand-dark p-3 rounded-2xl shadow-md border-2 border-[#FAF0DD] font-medium text-sm leading-relaxed"
        >
          {/* Bubble tail */}
          <div className="absolute left-0 top-1/2 -translate-x-[9px] -translate-y-1/2 w-4 h-4 bg-white border-l-2 border-b-2 border-[#FAF0DD] rotate-45" />
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
