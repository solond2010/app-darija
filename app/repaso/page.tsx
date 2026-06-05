"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "../../components/Header";
import { BottomNav } from "../../components/BottomNav";
import { Meshi } from "../../components/Suki";
import { SpeakButton } from "../../components/SpeakButton";
import { speak } from "../../utils/speech";
import { useStore, LearnedWord } from "../../lib/store";
import { Star, RefreshCw, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type Difficulty = "hard" | "ok" | "easy";

interface ReviewCard extends LearnedWord {
  _key: number; // unique key to allow re-adding duplicates
}

export default function RepasoPage() {
  const router = useRouter();
  const { learnedWords, wordMemory, reviewWord, addXP, isHydrated, setHydrated } = useStore();
  const [mounted, setMounted] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [reviewStack, setReviewStack] = useState<ReviewCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewFinished, setReviewFinished] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [results, setResults] = useState<{ hard: number; ok: number; easy: number }>({ hard: 0, ok: 0, easy: 0 });
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    setHydrated(true);
    setMounted(true);
  }, [setHydrated]);

  const categories = useMemo(() => {
    if (!learnedWords.length) return ["Todos"];
    const cats = Array.from(new Set(learnedWords.map((w) => w.category)));
    return ["Todos", ...cats];
  }, [learnedWords]);

  // Smart (spaced-repetition) stack: words that are DUE come first, weakest box
  // and most overdue first. New words (no memory) count as due now. If everything
  // is up to date, fall back to a free shuffled practice.
  const dueCount = useMemo(() => {
    const now = Date.now();
    return learnedWords.filter((w) => {
      const m = wordMemory?.[w.darija.toLowerCase().trim()];
      return !m || m.due <= now;
    }).length;
  }, [learnedWords, wordMemory]);

  const buildStack = (category: string) => {
    const now = Date.now();
    const filtered = category === "Todos"
      ? learnedWords
      : learnedWords.filter((w) => w.category === category);
    const withMem = filtered.map((w) => {
      const m = wordMemory?.[w.darija.toLowerCase().trim()];
      return { w, box: m?.box ?? 0, due: m?.due ?? 0 };
    });
    const due = withMem.filter((x) => x.due <= now).sort((a, b) => a.box - b.box || a.due - b.due);
    const pool = due.length > 0 ? due : [...withMem].sort(() => Math.random() - 0.5);
    return pool.slice(0, 15).map((x, i) => ({ ...x.w, _key: i }));
  };

  useEffect(() => {
    if (isHydrated && learnedWords.length > 0) {
      startReview(selectedCategory);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, learnedWords]);

  // Auto-pronounce each card's Darija word when it appears (front side).
  useEffect(() => {
    const w = reviewStack[currentIdx];
    if (!reviewFinished && w?.darija) {
      const t = setTimeout(() => speak(w.darija), 250);
      return () => clearTimeout(t);
    }
  }, [currentIdx, reviewStack, reviewFinished]);

  const startReview = (category: string) => {
    setSelectedCategory(category);
    setReviewStack(buildStack(category));
    setCurrentIdx(0);
    setIsFlipped(false);
    setReviewFinished(false);
    setXpGained(0);
    setResults({ hard: 0, ok: 0, easy: 0 });
  };

  const handleDifficulty = (difficulty: Difficulty) => {
    // Update the spaced-repetition schedule for this word.
    const reviewed = reviewStack[currentIdx];
    if (reviewed) reviewWord(reviewed.darija, difficulty);

    const xpMap: Record<Difficulty, number> = { hard: 0, ok: 1, easy: 3 };
    const gained = xpMap[difficulty];
    if (gained > 0) {
      addXP(gained);
      setXpGained((p) => p + gained);
    }
    setResults((prev) => ({ ...prev, [difficulty]: prev[difficulty] + 1 }));

    if (difficulty === "hard") {
      // Put the card back near the end so the user sees it again
      const current = reviewStack[currentIdx];
      const newCard = { ...current, _key: Date.now() };
      const newStack = [...reviewStack];
      const insertAt = Math.min(newStack.length, currentIdx + 3);
      newStack.splice(insertAt, 0, newCard);
      setDirection(1);
      setReviewStack(newStack);
      if (currentIdx < newStack.length - 1) {
        setCurrentIdx((p) => p + 1);
        setIsFlipped(false);
      } else {
        setReviewFinished(true);
      }
    } else {
      setDirection(1);
      if (currentIdx < reviewStack.length - 1) {
        setCurrentIdx((p) => p + 1);
        setIsFlipped(false);
      } else {
        setReviewFinished(true);
      }
    }
  };

  if (!mounted || !isHydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-slate-400 font-title font-medium text-sm">Cargando...</p>
      </div>
    );
  }

  const currentWord = reviewStack[currentIdx];
  const progressPercent = reviewStack.length > 0 ? (currentIdx / reviewStack.length) * 100 : 0;

  return (
    <div className="min-h-screen pb-20 flex flex-col max-w-md mx-auto relative overflow-hidden">
      <Header />

      <main className="flex-1 px-5 pt-3 flex flex-col overflow-y-auto no-scrollbar pb-6">

        {/* Empty state */}
        {learnedWords.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-10">
            <Meshi
              mood="thinking"
              size={170}
              showBubble={true}
              bubbleText="¡Sara, aún no tienes palabras para repasar! Completa tu primera lección primero. 🐱"
            />
            <div className="mt-2">
              <h3 className="text-xl font-bold font-title text-brand-dark">Mazo vacío</h3>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed mt-1">
                Las palabras de las lecciones aparecerán aquí para practicar.
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="py-3.5 px-8 btn-3d-primary font-title text-sm"
            >
              Ir a las lecciones →
            </button>
          </div>

        ) : reviewFinished ? (
          /* ---- Finished screen ---- */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-6"
          >
            <Meshi
              mood="perfect"
              size={150}
              showBubble={true}
              bubbleText="¡Bravo Sara! Repaso completado. Tu memoria está fresquísima. 🐱✨"
            />
            <h3 className="text-2xl font-bold font-title text-brand-dark -mt-1">¡Repaso Finalizado!</h3>

            <div className="glass rounded-3xl p-5 w-full flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-semibold">Total revisadas</span>
                <span className="font-bold font-title text-brand-dark">{results.hard + results.ok + results.easy} cartas</span>
              </div>
              <div className="w-full h-px bg-brand-cream" />
              {/* Difficulty breakdown */}
              <div className="flex gap-2">
                <div className="flex-1 bg-rose-50 border-2 border-rose-100 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-rose-500">{results.hard}</p>
                  <p className="text-[10px] text-rose-400 font-bold">Difícil 😅</p>
                </div>
                <div className="flex-1 bg-amber-50 border-2 border-amber-100 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-amber-500">{results.ok}</p>
                  <p className="text-[10px] text-amber-400 font-bold">Bien 👍</p>
                </div>
                <div className="flex-1 bg-emerald-50 border-2 border-emerald-100 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-emerald-500">{results.easy}</p>
                  <p className="text-[10px] text-emerald-400 font-bold">Fácil ⚡</p>
                </div>
              </div>
              <div className="w-full h-px bg-brand-cream" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-semibold">XP ganado</span>
                <span className="font-bold text-brand-coral flex items-center gap-1">
                  <Star className="w-4 h-4 fill-brand-coral text-brand-coral" />
                  +{xpGained} XP
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full mt-1">
              <button onClick={() => startReview(selectedCategory)} className="w-full py-3.5 btn-3d-primary font-title text-sm flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Repasar otro mazo
              </button>
              <button onClick={() => router.push("/")} className="w-full py-3.5 btn-3d-secondary font-title text-sm">
                Volver al Inicio
              </button>
            </div>
          </motion.div>

        ) : (
          /* ---- Active review ---- */
          <div className="flex-1 flex flex-col gap-3 py-1">

            {/* Spaced-repetition status */}
            <div className="glass rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-brand-coral/15 flex-shrink-0">
                <RefreshCw className="w-3.5 h-3.5 text-brand-coral" />
              </div>
              <p className="text-xs font-semibold text-slate-600 leading-snug">
                {dueCount > 0
                  ? <>Tienes <b className="text-brand-coral font-title">{dueCount}</b> {dueCount === 1 ? "palabra" : "palabras"} para repasar hoy 🧠</>
                  : <>¡Todo al día! 🎉 Repasa libremente las que quieras.</>}
              </p>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => startReview(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold font-title border-2 transition-all ${
                    selectedCategory === cat
                      ? "bg-gradient-to-br from-brand-saffron to-brand-coral text-white border-brand-coral/60 glow-coral"
                      : "bg-white/70 backdrop-blur-md text-slate-500 border-white/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                <span className="uppercase tracking-widest">Repaso · {selectedCategory}</span>
                <span>{currentIdx + 1} / {reviewStack.length}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-saffron via-brand-coral to-brand-rose rounded-full"
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Flip card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-56 perspective-1000 cursor-pointer flex-shrink-0"
            >
              {/* A plain keyed motion.div (not <AnimatePresence mode="wait">) so a
                  stuck exit animation can never freeze the card on the old word —
                  same deadlock that blocked the lesson exercises. */}
                <motion.div
                  key={`${currentWord?._key}-${currentIdx}`}
                  initial={{ opacity: 0, x: direction * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22 }}
                  className="w-full h-full"
                >
                  <div
                    className={`w-full h-full duration-500 transform-style-3d relative rounded-3xl border border-white/70 bg-white/85 backdrop-blur-md shadow-[0_8px_30px_rgba(42,35,66,0.12)] ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-6 text-center">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-brand-coral bg-brand-pink/20 px-3 py-1 rounded-full mb-4">
                        Darija · ¿Cuál es la traducción?
                      </span>
                      <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-bold font-title text-brand-dark">
                          {currentWord?.darija}
                        </h2>
                        {currentWord?.darija && (
                          <SpeakButton text={currentWord.darija} size={22} className="p-1.5 bg-brand-pink/15" />
                        )}
                      </div>
                      {currentWord?.category && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full mt-3">
                          {currentWord.category}
                        </span>
                      )}
                      <p className="text-[10px] text-slate-400 mt-6 animate-pulse">Toca para revelar 🔄</p>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 text-center bg-brand-mint/10 rounded-3xl">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#1A5C4A] bg-brand-mint/30 px-3 py-1 rounded-full mb-4">
                        Traducción Español
                      </span>
                      <h2 className="text-2xl font-bold text-brand-dark">
                        {currentWord?.spanish}
                      </h2>
                      {currentWord?.example && (
                        <p className="text-[11px] text-slate-500 italic mt-3 bg-white/60 p-2 rounded-xl max-w-[90%] leading-relaxed">
                          {currentWord.example}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-4">Toca para volver 🔄</p>
                    </div>
                  </div>
                </motion.div>
            </div>

            {/* 3-level difficulty buttons */}
            <div className={`flex gap-2 transition-opacity duration-300 ${isFlipped ? "opacity-100" : "opacity-25 pointer-events-none"}`}>
              <button
                onClick={() => handleDifficulty("hard")}
                className="flex-1 py-3.5 rounded-2xl bg-white border-2 border-rose-200 border-b-[3px] border-b-rose-300 text-rose-500 text-xs font-bold font-title flex flex-col items-center gap-0.5 hover:bg-rose-50 transition-colors"
              >
                <span className="text-base">😅</span>
                Difícil
              </button>
              <button
                onClick={() => handleDifficulty("ok")}
                className="flex-1 py-3.5 rounded-2xl bg-white border-2 border-amber-200 border-b-[3px] border-b-amber-300 text-amber-600 text-xs font-bold font-title flex flex-col items-center gap-0.5 hover:bg-amber-50 transition-colors"
              >
                <span className="text-base">👍</span>
                Bien <span className="text-[9px] opacity-70">+1 XP</span>
              </button>
              <button
                onClick={() => handleDifficulty("easy")}
                className="flex-1 py-3.5 rounded-2xl bg-white border-2 border-emerald-200 border-b-[3px] border-b-emerald-300 text-emerald-600 text-xs font-bold font-title flex flex-col items-center gap-0.5 hover:bg-emerald-50 transition-colors"
              >
                <span className="text-base">⚡</span>
                Fácil <span className="text-[9px] opacity-70">+3 XP</span>
              </button>
            </div>

            {/* Meshi hint */}
            <div className="flex justify-center mt-1">
              <Meshi
                mood={isFlipped ? "thinking" : "normal"}
                size={75}
                showBubble={true}
                bubbleText={isFlipped
                  ? "¿Lo recuerdas bien? ¡Sé honesta contigo misma! 🤔"
                  : "¿Te suena esta palabra? ¡Gira la carta! 🃏"
                }
              />
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
