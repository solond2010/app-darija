"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore, LearnedWord, getLevelInfo } from "../../../lib/store";
import { Exercise } from "../../../data/lessons";
import { useContent } from "../../../lib/content";
import { useCelebration, Celebration } from "../../../lib/celebration";
import { achievementsData } from "../../../data/achievements";
import { getRandomMessage } from "../../../data/meshi-messages";
import { Meshi, MeshiMood } from "../../../components/Suki";
import { ExerciseRenderer } from "../../../components/ExerciseTypes/ExerciseRenderer";
import { LessonIntro } from "../../../components/LessonIntro";
import { normalizeDarija } from "../../../utils/speech";

// Difficulty ranking so every lesson ramps from recognition (easy) to
// production (hard) — Duolingo-style.
const EX_RANK: Record<string, number> = {
  "flashcard-reveal": 0,
  "match-pairs": 1,
  "multiple-choice": 2,
  "true-false": 3,
  "listening-select": 4,
  "fill-blank": 5,
  "word-order": 6,
  "conversation": 7,
  "translation": 8,
  "listen-type": 9,
};
function orderExercises<T extends { type: string }>(exercises: T[]): T[] {
  return [...exercises]
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (EX_RANK[a.e.type] ?? 5) - (EX_RANK[b.e.type] ?? 5) || a.i - b.i)
    .map(({ e }) => e);
}
import { sound } from "../../../utils/sound";
import { haptics } from "../../../utils/haptics";
import { X, Star, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function LeccionPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const { addXP, completeLesson, addLearnedWords, soundsEnabled } = useStore();
  const unitsData = useContent((s) => s.units);
  const lessonVocabulary = useContent((s) => s.vocabulary);
  const contentLoaded = useContent((s) => s.loaded);

  const [lesson, setLesson] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAns, setSelectedAns] = useState<any>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const [attempts, setAttempts] = useState(1);
  const [errorsCount, setErrorsCount] = useState(0);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [combo, setCombo] = useState(0); // consecutive correct answers in this lesson
  const [lastXpGain, setLastXpGain] = useState(10);

  const [meshiMood, setMeshiMood] = useState<MeshiMood>("normal");
  const [meshiSpeech, setMeshiSpeech] = useState("");

  const [isLessonFinished, setIsLessonFinished] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const startTimeRef = useRef<number>(Date.now());
  const startedRef = useRef(false);

  useEffect(() => {
    let found: any = null;
    unitsData.forEach((u) => {
      const m = u.lessons.find((l) => l.id === lessonId);
      if (m) found = m;
    });
    if (found) {
      // Order exercises easy→hard once, then set the lesson only once. An async
      // content refresh (Supabase) must never swap the lesson object mid-play.
      const ordered = { ...found, exercises: orderExercises(found.exercises) };
      setLesson((prev: any) => prev ?? ordered);
      if (!startedRef.current) {
        startedRef.current = true;
        startTimeRef.current = Date.now();
        setMeshiSpeech(`¡Yallah Sara! Amin preparó la lección ${lessonId} para ti. 🐱🤍`);
      }
    } else if (contentLoaded) {
      // Content has finished loading and the lesson genuinely doesn't exist.
      router.push("/");
    }
  }, [lessonId, router, unitsData, contentLoaded]);

  useEffect(() => {
    setIsCardFlipped(false);
  }, [currentIdx]);

  if (!lesson) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-slate-400 font-title font-medium text-sm">Cargando lección...</p>
      </div>
    );
  }

  const currentExercise = lesson.exercises[currentIdx];

  const getCorrectAnswerText = (): string | null => {
    if (!currentExercise) return null;
    const t = currentExercise.type;
    if (["multiple-choice", "fill-blank", "listening-select", "conversation"].includes(t))
      return currentExercise.answer as string;
    if (t === "translation" || t === "listen-type") return (currentExercise.answer as string[])?.[0] ?? null;
    if (t === "word-order") return currentExercise.orderedAnswer?.join(" ") ?? null;
    if (t === "true-false") return (currentExercise.answer as boolean) ? "Verdadero ✓" : "Falso ✗";
    return null;
  };

  const handleCheck = (directAnswer?: boolean) => {
    const ans = directAnswer !== undefined ? directAnswer : selectedAns;
    if (directAnswer !== undefined) setSelectedAns(directAnswer);

    let correct = false;
    const t = currentExercise.type;

    if (["multiple-choice", "fill-blank", "listening-select"].includes(t)) {
      correct = ans === currentExercise.answer;
    } else if (t === "translation") {
      // Forgiving: ignore case, accents, punctuation, hyphens AND spaces.
      const norm = (s: string) =>
        s.toLowerCase().trim()
          .normalize("NFD").replace(/[̀-ͯ]/g, "")
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡]/g, "")
          .replace(/\s/g, "");
      correct = (currentExercise.answer as string[]).some((a) => norm(ans || "") === norm(a));
    } else if (t === "listen-type") {
      const accepted = (currentExercise.answer as string[]) || [];
      correct = accepted.some((a) => normalizeDarija(ans || "") === normalizeDarija(a));
    } else if (t === "match-pairs" || t === "conversation") {
      // Self-validating exercises: the component only reports `true` once the
      // user has completed it correctly (matched all pairs / answered every
      // dialogue turn). There is no separate per-answer key to compare against.
      correct = ans === true;
    } else if (t === "word-order") {
      const ordered = currentExercise.orderedAnswer || [];
      const user = (ans as string[]) || [];
      correct = user.length === ordered.length && user.every((w: string, i: number) => w.toLowerCase() === ordered[i].toLowerCase());
    } else if (t === "true-false") {
      correct = ans === currentExercise.answer;
    } else if (t === "flashcard-reveal") {
      correct = ans === true;
    }

    setIsAnswerChecked(true);
    setLastAnswerCorrect(correct);

    if (correct) {
      if (soundsEnabled) sound.playCorrect();
      haptics.success();
      // Base XP + combo bonus: chaining correct answers without a miss pays more.
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo >= 2) {
        if (soundsEnabled) sound.playCombo(newCombo);
        haptics.medium();
      }
      const base = attempts === 1 ? 10 : 5;
      const comboBonus = newCombo >= 2 ? Math.min((newCombo - 1) * 2, 10) : 0;
      const gain = base + comboBonus;
      setLastXpGain(gain);
      setTotalXPEarned((p) => p + gain);
      setMeshiMood("celebrating");
      setMeshiSpeech(getRandomMessage("correct").text);
    } else {
      if (soundsEnabled) sound.playIncorrect();
      haptics.error();
      setCombo(0); // a miss breaks the combo
      setErrorsCount((p) => p + 1);
      setMeshiMood("sad");
      setMeshiSpeech(getRandomMessage("incorrect").text);
      // Keep the wrong choice visible (red + ✗) while showing feedback.
      // It gets cleared on retry in handleContinue.
      setAttempts(attempts === 1 ? 2 : 3);
    }
  };

  const handleContinue = () => {
    haptics.light();
    // The "retry" path must match the button's "INTENTAR DE NUEVO" condition
    // EXACTLY (attempts === 2 && !lastAnswerCorrect), so the label and the action
    // can never disagree. Previously this keyed off meshiMood, a presentational
    // value, which risked the button saying "Continuar" while the handler did a
    // retry (the lesson appearing not to advance).
    const isRetry = isAnswerChecked && attempts === 2 && !lastAnswerCorrect;
    if (isRetry) {
      setIsAnswerChecked(false);
      setLastAnswerCorrect(null);
      setSelectedAns(null);
      setMeshiMood("thinking");
      setMeshiSpeech("¡Tú puedes Sara! Vamos a intentarlo otra vez. 💪");
      return;
    }
    // Advance to the next exercise, or finish the lesson on the last one.
    setAttempts(1);
    setIsAnswerChecked(false);
    setLastAnswerCorrect(null);
    setSelectedAns(null);
    setMeshiMood("normal");
    setMeshiSpeech(getRandomMessage("nextExercise").text);

    const total = lesson?.exercises?.length ?? 0;
    if (currentIdx < total - 1) {
      setCurrentIdx((p) => p + 1);
    } else {
      handleLessonCompletion();
    }
  };

  const handleLessonCompletion = () => {
    setIsLessonFinished(true);
    haptics.celebrate();
    const gotPerfect = errorsCount === 0;
    const { achievementsUnlocked, unlockedUnit } = completeLesson(lessonId, gotPerfect, unitsData);
    setUnlockedBadges(achievementsUnlocked);

    // Detect level-up + daily-goal crossing: snapshot before/after adding XP.
    const todayStr = new Date().toLocaleDateString("en-CA");
    const sBefore = useStore.getState();
    const levelBefore = getLevelInfo(sBefore.xp).level;
    const dailyGoal = sBefore.dailyGoal;
    const todayXPBefore = sBefore.todayXPDate === todayStr ? sBefore.todayXP : 0;
    addXP(gotPerfect ? 150 + totalXPEarned : 50 + totalXPEarned);
    const after = getLevelInfo(useStore.getState().xp);
    const todayXPAfter = useStore.getState().todayXP;
    const crossedDailyGoal = todayXPBefore < dailyGoal && todayXPAfter >= dailyGoal;

    const words = lessonVocabulary[lessonId];
    if (words) addLearnedWords(words);
    if (gotPerfect) {
      if (soundsEnabled) sound.playFanfare();
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.55 } });
    } else {
      // A little spark for every completion too.
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }

    // Queue full-screen celebrations: level-up first, then each new achievement.
    const cels: Celebration[] = [];
    if (after.level > levelBefore) {
      if (soundsEnabled) sound.playFanfare();
      cels.push({ kind: "level", level: after.level, name: after.name });
    }
    if (unlockedUnit) {
      cels.push({ kind: "unit", title: unlockedUnit.title, emoji: unlockedUnit.emoji });
    }
    if (crossedDailyGoal) {
      cels.push({ kind: "daily", goal: dailyGoal });
    }
    achievementsUnlocked.forEach((id) => {
      const a = achievementsData.find((x) => x.id === id);
      if (a) cels.push({ kind: "achievement", emoji: a.emoji, title: a.title, message: a.unlockedMessage });
    });
    if (cels.length > 0) {
      setTimeout(() => useCelebration.getState().push(cels), 650);
    }
    // Tell the server Sara played today → cron won't send reminder tonight
    const state = useStore.getState();
    fetch("/api/push/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        streak: state.streak,
        lastPlayedDate: new Date().toLocaleDateString("en-CA"),
        playedToday: true,
      }),
    }).catch(() => {});
  };

  const handleExitLesson = () => {
    if (window.confirm("¿Seguro que quieres salir de la lección? Perderás tu progreso actual.")) {
      router.push("/");
    }
  };

  // Lesson complete — use same h-dvh flex layout as lesson itself to prevent size jump
  if (isLessonFinished) {
    const isPerfect = errorsCount === 0;
    const totalXP = totalXPEarned + 50 + (isPerfect ? 100 : 0);

    // Keep the next-lesson lookup only for the CTA label.
    const allLessonsFlat = unitsData.flatMap((u) => u.lessons.map((l) => ({ id: l.id })));
    const curIdx = allLessonsFlat.findIndex((l) => l.id === lessonId);
    const nextLesson = curIdx >= 0 ? allLessonsFlat[curIdx + 1] : null;

    // Minimal completion screen: cat + title + one XP pill + one CTA.
    return (
      <div className="h-dvh flex flex-col max-w-md mx-auto overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-8 pb-4 flex flex-col items-center justify-center gap-6">
          {/* Cat + title */}
          <div className="flex flex-col items-center text-center">
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45, ease: "backOut" }}>
              <Meshi
                mood={isPerfect ? "perfect" : "celebrating"}
                size={170}
                showBubble={true}
                bubbleText={isPerfect
                  ? "¡Increíble Sara! ¡Lección perfecta! 🔥🐱"
                  : "¡Bravo Sara! ¡Lección completada! 🎉"
                }
              />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold font-title text-brand-dark mt-4 leading-none"
            >
              {isPerfect ? "¡Lección Perfecta! ⭐" : "¡Buen trabajo!"}
            </motion.h2>
          </div>

          {/* Single XP pill (gold) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full text-[#3A2C06] glow-gold bg-gradient-to-br from-[#E8C766] to-[#D9A441]"
          >
            <Star className="w-6 h-6 fill-[#3A2C06] text-[#3A2C06]" />
            <span className="text-2xl font-bold font-title">+<CountUp to={totalXP} /> XP</span>
          </motion.div>
        </div>

        {/* Fixed footer CTA */}
        <div className="flex-shrink-0 px-5 pb-6 pt-3 glass border-t border-white/40">
          <button
            onClick={() => {
              const before = useStore.getState().streak;
              useStore.getState().incrementStreak();
              const afterStreak = useStore.getState().streak;
              if (afterStreak > before) {
                useCelebration.getState().push([{ kind: "streak", days: afterStreak }]);
              }
              router.push("/");
            }}
            className="w-full py-4 btn-3d-primary font-title text-base"
          >
            {nextLesson ? "¡Hecho! Continuar 🐱" : "¡Listo! Yallah 🐱"}
          </button>
        </div>
      </div>
    );
  }

  // "Learn these words" intro — teach before testing.
  const introWords = lessonVocabulary[lessonId] || [];
  if (showIntro && introWords.length > 0) {
    return (
      <LessonIntro
        words={introWords}
        onExit={() => router.push("/")}
        onStart={() => {
          setShowIntro(false);
          startTimeRef.current = Date.now(); // don't count intro time
        }}
      />
    );
  }

  // Active lesson
  return (
    <div className="h-dvh flex flex-col max-w-md mx-auto relative select-none overflow-hidden">
      {/* Header */}
      <header className="h-14 px-4 glass flex items-center gap-3 border-b border-white/40 flex-shrink-0 z-30">
        <button
          onClick={handleExitLesson}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5 stroke-2" />
        </button>

        {/* Segmented progress bar */}
        <div className="flex-1 flex gap-1.5">
          {lesson.exercises.map((_: unknown, i: number) => (
            <div
              key={i}
              className={`flex-1 h-2.5 rounded-full transition-colors duration-300 ${
                i < currentIdx
                  ? "bg-gradient-to-r from-brand-saffron via-brand-coral to-brand-rose shadow-[0_0_8px_rgba(107,122,63,0.55)]"
                  : i === currentIdx
                  ? "bg-brand-coral/40"
                  : "bg-slate-200/70"
              }`}
            />
          ))}
        </div>

        {/* Combo counter (replaces the old lives slot) */}
        <AnimatePresence>
          {combo >= 2 && (
            <motion.div
              key="combo"
              initial={{ scale: 0.5, opacity: 0, x: 8 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 480, damping: 16 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold font-title text-white flex-shrink-0 shadow-[0_3px_10px_rgba(107,122,63,0.45)]"
              style={{ background: "linear-gradient(135deg, #8B9C52, #5E6B34)" }}
            >
              <motion.span
                key={combo}
                initial={{ scale: 1.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 12 }}
                className="inline-flex items-center gap-0.5"
              >
                🔥 x{combo}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Meshi strip — a small "coach tip" card */}
      <section className="px-3 pt-2.5 pb-1.5 flex-shrink-0">
        <div className="glass rounded-2xl px-2.5 py-2 flex items-center overflow-hidden">
          <Meshi mood={meshiMood} size={64} showBubble={true} bubbleText={meshiSpeech} interactive={false} />
        </div>
      </section>

      {/* Exercise area.
          NOTE: do NOT wrap this in <AnimatePresence mode="wait">. Nested inside
          the page-level transition (template.tsx), the exit animation could fail
          to complete, deadlocking AnimatePresence so the old exercise stayed on
          screen even though currentIdx had advanced (the "no avanza" bug). A
          plain keyed motion.div remounts cleanly on every question — same
          slide-in feel, zero deadlock risk. */}
      <main className="flex-1 min-h-0 px-4 py-3 flex flex-col justify-center items-center overflow-y-auto no-scrollbar">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22 }}
          className="w-full"
        >
          <ExerciseRenderer
            exercise={currentExercise}
            selectedAnswer={selectedAns}
            onSelect={setSelectedAns}
            isAnswerChecked={isAnswerChecked}
            onFlip={setIsCardFlipped}
          />
        </motion.div>
      </main>

      {/* Footer action bar */}
      <footer className={`flex-shrink-0 flex flex-col transition-all duration-300 ${
        isAnswerChecked
          ? lastAnswerCorrect
            ? "bg-emerald-50 border-t-2 border-emerald-200"
            : "bg-rose-50 border-t-2 border-rose-200"
          : "glass border-t border-white/40"
      }`}>
        {/* Feedback */}
        <AnimatePresence>
          {isAnswerChecked && lastAnswerCorrect !== null && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="px-5 pt-4 pb-1"
            >
              {lastAnswerCorrect ? (
                <div className="flex items-center gap-2.5 relative">
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 14 }}
                    className="flex-shrink-0"
                  >
                    <CheckCircle2 className="w-7 h-7 text-emerald-500 fill-emerald-100" />
                  </motion.div>
                  <div>
                    <p className="font-bold font-title text-emerald-700 text-base leading-tight">¡Correcto!</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      {combo >= 2 ? `¡Combo x${combo}! 🔥` : "¡Sigue así!"}
                    </p>
                  </div>
                  <motion.span
                    initial={{ opacity: 0, y: 0, scale: 0.6 }}
                    animate={{ opacity: [0, 1, 1, 0], y: -28, scale: 1.1 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    className="absolute right-2 top-0 font-extrabold font-title text-emerald-500 text-lg"
                  >
                    +{lastXpGain} XP
                  </motion.span>
                </div>
              ) : (
                <div className="flex items-start gap-2.5">
                  <span className="text-xl flex-shrink-0 mt-0.5">😿</span>
                  <div>
                    <p className="font-bold font-title text-rose-700 text-sm leading-tight">Respuesta correcta:</p>
                    <p className="text-sm font-semibold text-rose-800 mt-0.5">{getCorrectAnswerText() ?? "—"}</p>
                    {currentExercise.hint && (
                      <p className="text-xs text-rose-600/90 mt-1 leading-relaxed">💡 {currentExercise.hint}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {currentExercise.type === "flashcard-reveal" && isCardFlipped && !isAnswerChecked ? (
            <div className="flex gap-3">
              <button onClick={() => handleCheck(false)} className="flex-1 py-4 rounded-2xl font-title text-sm btn-3d-gray">
                Necesito repasar 🔄
              </button>
              <button onClick={() => handleCheck(true)} className="flex-1 py-4 rounded-2xl font-title text-sm btn-3d-mint">
                ¡Lo sé! 👍
              </button>
            </div>
          ) : !isAnswerChecked ? (
            <button
              disabled={
                currentExercise.type === "flashcard-reveal"
                  ? !isCardFlipped
                  : selectedAns === null || (Array.isArray(selectedAns) && selectedAns.length === 0)
              }
              onClick={() => handleCheck()}
              className={`w-full py-4.5 rounded-[20px] font-title text-lg tracking-wide text-center transition-all ${
                (currentExercise.type === "flashcard-reveal"
                  ? isCardFlipped
                  : selectedAns !== null && (!Array.isArray(selectedAns) || selectedAns.length > 0))
                  ? "btn-3d-primary"
                  : "bg-brand-beige text-slate-400 cursor-not-allowed border-2 border-transparent"
              }`}
            >
              {currentExercise.type === "flashcard-reveal" ? "GIRAR CARTA 🔄" : "COMPROBAR"}
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className={`w-full py-4.5 rounded-[20px] font-title text-lg tracking-wide text-center ${
                lastAnswerCorrect ? "btn-3d-mint" : "btn-3d-primary"
              }`}
            >
              {attempts === 2 && !lastAnswerCorrect ? "INTENTAR DE NUEVO 💪" : "CONTINUAR →"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

// Number that animates up from 0 — that satisfying "ticking" feel on the results screen.
function CountUp({ to, duration = 900 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (to <= 0) { setVal(0); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // ease-out for a nicer finish
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{val}</>;
}
