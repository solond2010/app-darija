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

// ── Palette (warm + cute, fits the olive theme) ──
const FUR = "#F8EFDC";       // cream fur
const LINE = "#3B352B";      // warm dark outline
const BLUSH = "#EBA39A";     // cheek blush
const EAR_IN = "#F2C7B8";    // inner ear
const FEZ = "#D6584F";       // Moroccan fez (tarbouche)
const NOSE = "#E0897F";      // little nose

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

  // ── Shared cute parts (round head, soft ears, cheeks, body) ──
  // Eyes sit at x≈60 / x≈90, y≈68 — close together and large = kawaii.
  const ears = (
    <g stroke={LINE} strokeWidth="3" strokeLinejoin="round">
      <path d="M 47 44 Q 33 38 34 22 Q 48 24 58 40 Z" fill={FUR} />
      <path d="M 48 41 Q 39 36 40 27 Q 49 29 55 39 Z" fill={EAR_IN} stroke="none" />
      <path d="M 103 44 Q 117 38 116 22 Q 102 24 92 40 Z" fill={FUR} />
      <path d="M 102 41 Q 111 36 110 27 Q 101 29 95 39 Z" fill={EAR_IN} stroke="none" />
    </g>
  );

  const head = (
    <>
      <ellipse cx="75" cy="70" rx="47" ry="42" fill={FUR} stroke={LINE} strokeWidth="3" />
      <ellipse cx="50" cy="80" rx="7.5" ry="4.5" fill={BLUSH} opacity="0.75" />
      <ellipse cx="100" cy="80" rx="7.5" ry="4.5" fill={BLUSH} opacity="0.75" />
    </>
  );

  const nose = (
    <path d="M 71 73 L 79 73 L 75 78 Z" fill={NOSE} stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
  );

  const whiskers = (
    <g stroke={LINE} strokeWidth="2" strokeLinecap="round" opacity="0.85">
      <line x1="30" y1="72" x2="14" y2="69" />
      <line x1="30" y1="78" x2="15" y2="80" />
      <line x1="120" y1="72" x2="136" y2="69" />
      <line x1="120" y1="78" x2="135" y2="80" />
    </g>
  );

  const body = (
    <>
      <path d="M 47 98 Q 39 122 45 140 L 105 140 Q 111 122 103 98 Z" fill={FUR} stroke={LINE} strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="75" cy="126" rx="17" ry="20" fill="#FFFDF6" opacity="0.7" />
      <ellipse cx="49" cy="104" rx="7" ry="11" fill={FUR} stroke={LINE} strokeWidth="2.5" transform="rotate(-16 49 104)" />
      <ellipse cx="101" cy="104" rx="7" ry="11" fill={FUR} stroke={LINE} strokeWidth="2.5" transform="rotate(16 101 104)" />
    </>
  );

  const fez = (
    <g stroke={LINE} strokeWidth="3" strokeLinejoin="round">
      <path d="M 60 30 L 90 30 L 86 14 L 64 14 Z" fill={FEZ} />
      <ellipse cx="75" cy="30" rx="15" ry="3.5" fill={FEZ} />
      <path d="M 75 14 L 75 8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="75" cy="7" r="2.5" fill={LINE} stroke="none" />
    </g>
  );

  // Big round open eyes with two shine dots — the default cute look.
  const eyesOpen = (
    <g>
      <ellipse cx="60" cy="68" rx="9.5" ry="11" fill={LINE} />
      <ellipse cx="90" cy="68" rx="9.5" ry="11" fill={LINE} />
      <circle cx="56.5" cy="63.5" r="3.3" fill="#fff" />
      <circle cx="63" cy="72" r="1.7" fill="#fff" />
      <circle cx="86.5" cy="63.5" r="3.3" fill="#fff" />
      <circle cx="93" cy="72" r="1.7" fill="#fff" />
    </g>
  );

  // Blink overlay matches the open-eye centers.
  const blinkOverlay = isBlinking ? (
    <g>
      <ellipse cx="60" cy="68" rx="11" ry="6" fill={FUR} />
      <ellipse cx="90" cy="68" rx="11" ry="6" fill={FUR} />
      <path d="M 50 68 Q 60 74 70 68" fill="none" stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 80 68 Q 90 74 100 68" fill="none" stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
    </g>
  ) : null;

  const renderCat = () => {
    switch (mood) {
      case "celebrating":
        return (
          <motion.g animate={{ y: [0, -16, 0], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 0.75 }}>
            {fez}
            <motion.text x="50" y="20" fontSize="11" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>✨</motion.text>
            {ears}
            {head}
            {/* Happy closed eyes ^ ^ */}
            <path d="M 51 70 Q 60 60 69 70" fill="none" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
            <path d="M 81 70 Q 90 60 99 70" fill="none" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
            {nose}
            {/* Open happy smile */}
            <path d="M 66 77 Q 75 88 84 77 Q 75 82 66 77 Z" fill="#B23A3A" stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />
            {whiskers}
            {body}
          </motion.g>
        );

      case "sad":
        return (
          <motion.g animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
            <g transform="rotate(-8 75 22)">{fez}</g>
            {ears}
            {head}
            {/* Worried eyes */}
            <ellipse cx="60" cy="69" rx="8.5" ry="10" fill={LINE} />
            <ellipse cx="90" cy="69" rx="8.5" ry="10" fill={LINE} />
            <circle cx="57" cy="65" r="3" fill="#fff" />
            <circle cx="87" cy="65" r="3" fill="#fff" />
            {/* sad brows */}
            <path d="M 50 58 Q 58 55 67 60" fill="none" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 83 60 Q 92 55 100 58" fill="none" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
            {blinkOverlay}
            {/* tear */}
            <motion.path d="M 58 78 Q 58 88 62 88 Q 66 88 62 78 Z" fill="#64B5F6"
              animate={{ y: [0, 4, 8], opacity: [1, 1, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeIn" }} />
            {nose}
            <path d="M 69 82 Q 75 77 81 82" fill="none" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
            {whiskers}
            {body}
          </motion.g>
        );

      case "sleeping":
        return (
          <motion.g animate={{ scaleY: [1, 0.97, 1] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}>
            {fez}
            {ears}
            {head}
            {/* gentle closed eyes */}
            <path d="M 50 69 Q 60 75 70 69" fill="none" stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 80 69 Q 90 75 100 69" fill="none" stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
            {nose}
            <path d="M 70 80 Q 75 84 80 80" fill="none" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
            {whiskers}
            <motion.text x="110" y="40" fontSize="14" fontWeight="bold" fill={FEZ}
              animate={{ opacity: [0, 1, 0], y: [40, 24, 10], scale: [0.7, 1.1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2.8 }} style={{ fontFamily: "var(--font-fredoka)" }}>Zzz</motion.text>
            {body}
          </motion.g>
        );

      case "perfect":
        return (
          <motion.g animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}>
            {/* Crown over the fez */}
            <path d="M 52 16 L 62 4 L 75 11 L 88 4 L 98 16 Z" fill="#E0B84B" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
            {fez}
            {ears}
            {head}
            {/* Star eyes */}
            <g transform="translate(8,11)">
              <polygon points="52,48 55,54 61,55 56,59 58,65 52,62 46,65 48,59 43,55 49,54" fill="#E0B84B" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
            </g>
            <g transform="translate(-8,11)">
              <polygon points="98,48 101,54 107,55 102,59 104,65 98,62 92,65 94,59 89,55 95,54" fill="#E0B84B" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
            </g>
            {nose}
            <path d="M 66 77 Q 75 87 84 77 Q 75 82 66 77 Z" fill="#B23A3A" stroke={LINE} strokeWidth="2.5" strokeLinejoin="round" />
            {whiskers}
            {body}
          </motion.g>
        );

      case "thinking":
        return (
          <motion.g animate={{ rotate: [0, 3, -3, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
            {fez}
            {ears}
            {head}
            {/* Eyes glancing up */}
            <ellipse cx="60" cy="68" rx="9.5" ry="11" fill={LINE} />
            <ellipse cx="90" cy="68" rx="9.5" ry="11" fill={LINE} />
            <circle cx="62" cy="63" r="3.3" fill="#fff" />
            <circle cx="92" cy="63" r="3.3" fill="#fff" />
            {blinkOverlay}
            {nose}
            <path d="M 70 80 Q 74 83 78 80" fill="none" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
            {whiskers}
            {/* thought bubbles */}
            <motion.circle cx="128" cy="44" r="4" fill="#E7E3D0" stroke={LINE} strokeWidth="1.5"
              animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1.5 }} />
            <motion.circle cx="140" cy="32" r="7" fill="#E7E3D0" stroke={LINE} strokeWidth="2"
              animate={{ scale: [1, 0.8, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} />
            <text x="137" y="36" fontSize="11" fontWeight="bold" fill={LINE} style={{ fontFamily: "var(--font-fredoka)" }}>?</text>
            {body}
          </motion.g>
        );

      case "cheering":
      case "normal":
      default:
        return (
          <motion.g animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
            {fez}
            {ears}
            {head}
            {mood === "cheering" ? (
              <g>
                {/* left eye open, right eye winking */}
                <ellipse cx="60" cy="68" rx="9.5" ry="11" fill={LINE} />
                <circle cx="56.5" cy="63.5" r="3.3" fill="#fff" />
                <circle cx="63" cy="72" r="1.7" fill="#fff" />
                <path d="M 81 69 Q 90 62 99 69" fill="none" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
              </g>
            ) : (
              eyesOpen
            )}
            {blinkOverlay}
            {nose}
            {/* cute ω mouth */}
            <path d="M 75 78 Q 70 84 65 79" fill="none" stroke={LINE} strokeWidth="2.8" strokeLinecap="round" />
            <path d="M 75 78 Q 80 84 85 79" fill="none" stroke={LINE} strokeWidth="2.8" strokeLinecap="round" />
            {whiskers}
            {body}
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
          {/* Tail — behind the body, wags based on mood */}
          <motion.g style={{ transformOrigin: "104px 132px" }} animate={tailAnim}>
            <path d="M 104 132 C 128 124 146 112 150 94 C 153 82 142 76 135 81"
              fill="none" stroke={LINE} strokeWidth="7" strokeLinecap="round" />
            <path d="M 104 132 C 127 125 144 113 148 95 C 151 83 140 78 133 82"
              fill="none" stroke={FUR} strokeWidth="4" strokeLinecap="round" />
          </motion.g>
          {renderCat()}
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
