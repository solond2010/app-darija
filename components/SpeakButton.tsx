"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { speak, canSpeak } from "../utils/speech";
import { haptics } from "../utils/haptics";

interface SpeakButtonProps {
  text: string;
  size?: number; // icon size in px
  className?: string;
  rate?: number;
  label?: string; // accessible label
}

/** Tap to hear a Darija word/phrase pronounced. */
export const SpeakButton: React.FC<SpeakButtonProps> = ({
  text,
  size = 18,
  className = "",
  rate,
  label = "Escuchar pronunciación",
}) => {
  const [playing, setPlaying] = useState(false);

  if (!canSpeak()) return null;

  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    haptics.tap();
    speak(text, rate ? { rate } : undefined);
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), 700);
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.88 }}
      onClick={handle}
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-full text-brand-coral transition-colors ${className}`}
    >
      <Volume2 className={playing ? "animate-pulse" : ""} style={{ width: size, height: size }} />
    </motion.button>
  );
};

export default SpeakButton;
