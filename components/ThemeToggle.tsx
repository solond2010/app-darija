"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredTheme, toggleTheme, type Theme } from "../lib/theme";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getStoredTheme());
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-7 h-7 ${className}`} />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(toggleTheme())}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      aria-label="Cambiar tema"
      className={`relative w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-coral hover:bg-brand-coral/10 transition-colors overflow-hidden ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ y: 14, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.22 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isDark ? (
            <Moon className="w-4 h-4 fill-brand-amber text-brand-amber" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};
