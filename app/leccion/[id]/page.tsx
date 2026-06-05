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
import { SpeakButton } from "../../../components/SpeakButton";
import { normalizeDarija } from "../../../utils/speech";
import { sound } from "../../../utils/sound";
import { haptics } from "../../../utils/haptics";
import { Heart, X, Sparkles, Star, Flame, Trophy, CheckCircle2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { lessonVocabulary } from "../../../data/vocabulary";

export default function LeccionPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const { lives, decrementLive, refillLives, addXP, completeLesson, addLearnedWords, soundsEnabled } = useStore();
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
  const [localLives, setLocalLives] = useState(5);

  const [meshiMood, setMeshiMood] = useState<MeshiMood>("normal");
  const [meshiSpeech, setMeshiSpeech] = useState("");

  const [isLessonFinished, setIsLessonFinished] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const startedRef = useRef(false);

  useEffect(() => {
    let found: any = null;
    unitsData.forEach((u) => {
      const m = u.lessons.find((l) => l.id === lessonId);
      if (m) found = m;
    });
    if (found) {
      // Set the lesson only once. An async content refresh (Supabase) must never
      // swap the lesson object out from under an in-progress lesson — that would
      // reset the exercise and block "Continuar".
      setLesson((prev: any) => prev ?? found);
      if (!startedRef.current) {
        startedRef.current = true;
        setLocalLives(useStore.getState().lives);
        startTimeRef.current = Date.now();
        setMeshiSpeech(`¡Yallah Sara! Vamos a empezar la lección ${lessonId}. 🐱`);
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
    if (t === "translation" || t === "listen-type") return (currentExercise.answer as string[])[0];
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
      const norm = (s: string) =>
        s.toLowerCase().trim()
          .normalize("NFD").replace(/[̀-ͯ]/g, "")
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡]/g, "");
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
      setTotalXPEarned((p) => p + (attempts === 1 ? 10 : 5));
      setMeshiMood("celebrating");
      setMeshiSpeech(getRandomMessage("correct").text);
    } else {
      if (soundsEnabled) sound.playIncorrect();
      haptics.error();
      decrementLive();
      setLocalLives((p) => Math.max(0, p - 1));
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
      if (localLives <= 0) { setIsLessonFinished(true); return; }
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

  // Out of lives
  if (localLives <= 0 && !isLessonFinished) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center max-w-md mx-auto px-6 text-center gap-5">
        <Meshi mood="sleeping" size={180} showBubble={true} bubbleText="¡Oh no Sara, te has quedado sin corazones! 😿" />
        <h2 className="text-2xl font-bold font-title text-brand-dark">¡Sin vidas!</h2>
        <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
          Has agotado todos tus corazones. Ve a Repaso para practicar sin perder vidas, o recupéralas ahora.
        </p>
        <div className="flex flex-col gap-3 w-full mt-2">
          <button onClick={() => { refillLives(); router.push("/"); }} className="w-full py-4 btn-3d-primary font-title text-base">
            Recuperar vidas (+5 💖)
          </button>
          <button onClick={() => router.push("/")} className="w-full py-4 btn-3d-secondary font-title text-base">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // Lesson complete — use same h-dvh flex layout as lesson itself to prevent size jump
  if (isLessonFinished) {
    const isPerfect = errorsCount === 0;
    const totalXP = totalXPEarned + 50 + (isPerfect ? 100 : 0);
    const accuracy = Math.max(0, Math.round(((lesson.exercises.length - errorsCount) / lesson.exercises.length) * 100));

    // "Come back tomorrow" hook: the next lesson + its teaser.
    const allLessonsFlat = unitsData.flatMap((u) => u.lessons.map((l) => ({ id: l.id, title: l.title, teaser: l.teaser, emoji: u.emoji })));
    const curIdx = allLessonsFlat.findIndex((l) => l.id === lessonId);
    const nextLesson = curIdx >= 0 ? allLessonsFlat[curIdx + 1] : null;
    const teaserText: string | null = (lesson.teaser as string | undefined) || (nextLesson ? `${nextLesson.emoji} ${nextLesson.title}` : null);
    const vocabCount = lessonVocabulary[lessonId]?.length ?? 0;
    const elapsedSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const timeLabel = `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, "0")}`;

    return (
      <div className="h-dvh flex flex-col max-w-md mx-auto overflow-hidden">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-4 flex flex-col gap-5">
          {/* Cat + title */}
          <div className="flex flex-col items-center text-center">
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45, ease: "backOut" }}>
              <Meshi
                mood={isPerfect ? "perfect" : "celebrating"}
                size={160}
                showBubble={true}
                bubbleText={isPerfect
                  ? "¡Increíble Sara! ¡Una lección perfecta! ¡Eres increíble! 🔥🐱"
                  : "¡Bravo Sara! ¡Lección completada! ¡Sigue así! 🎉"
                }
              />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold font-title text-brand-dark mt-3 leading-none"
            >
              {isPerfect ? "¡Lección Perfecta! ⭐" : "¡Buen trabajo, Sara!"}
            </motion.h2>
            <p className="text-sm text-slate-400 mt-1">Lección {lessonId} completada</p>
          </div>

          {/* Stats cards — XP · Precisión · Tiempo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-3 gap-2.5"
          >
            <div className="rounded-2xl p-3 flex flex-col items-center text-center text-white glow-coral bg-gradient-to-br from-brand-saffron to-brand-coral">
              <div className="w-9 h-9 rounded-xl bg-white/25 flex items-center justify-center mb-1.5">
                <Star className="w-4.5 h-4.5 fill-white text-white" />
              </div>
              <span className="text-[8px] uppercase font-bold tracking-wider opacity-90">XP</span>
              <span className="text-xl font-bold font-title mt-0.5">+<CountUp to={totalXP} /></span>
            </div>
            <div className="rounded-2xl p-3 flex flex-col items-center text-center text-white bg-gradient-to-br from-brand-coral to-brand-rose">
              <div className="w-9 h-9 rounded-xl bg-white/25 flex items-center justify-center mb-1.5">
                <Trophy className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[8px] uppercase font-bold tracking-wider opacity-90">Precisión</span>
              <span className="text-xl font-bold font-title mt-0.5"><CountUp to={accuracy} />%</span>
            </div>
            <div className="rounded-2xl p-3 flex flex-col items-center text-center text-white bg-gradient-to-br from-brand-majorelle to-[#8b7dff]">
              <div className="w-9 h-9 rounded-xl bg-white/25 flex items-center justify-center mb-1.5">
                <Zap className="w-4.5 h-4.5 fill-white text-white" />
              </div>
              <span className="text-[8px] uppercase font-bold tracking-wider opacity-90">Tiempo</span>
              <span className="text-xl font-bold font-title mt-0.5">{timeLabel}</span>
            </div>
          </motion.div>

          {/* New badges */}
          {unlockedBadges.length > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="bg-gradient-to-r from-brand-lavender to-brand-pink rounded-2xl p-4 border-2 border-white shadow-sm flex items-start gap-3"
            >
              <Sparkles className="w-5 h-5 text-brand-coral mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm font-title text-brand-dark">¡Nuevo logro desbloqueado!</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  ¡Comprueba tus insignias en el perfil! 🏆
                </p>
              </div>
            </motion.div>
          )}

          {/* Vocabulary list */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-4"
          >
            <h4 className="text-[10px] font-bold font-title text-slate-400 uppercase tracking-wider mb-3">
              Vocabulario aprendido · {vocabCount} {vocabCount === 1 ? "palabra" : "palabras"}
            </h4>
            <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto no-scrollbar">
              {lessonVocabulary[lessonId]?.map((v, i) => (
                <div key={i} className="bg-brand-saffron/12 border border-brand-saffron/25 rounded-xl pl-2.5 pr-1.5 py-1.5 text-xs font-bold flex items-center gap-1">
                  <span className="text-brand-coral">{v.darija}</span>
                  <span className="text-slate-400 font-semibold">· {v.spanish}</span>
                  <SpeakButton text={v.darija} size={14} className="p-1 text-brand-coral/70" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Engagement: reward + tomorrow teaser + streak nudge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-4 bg-gradient-to-br from-brand-majorelle/12 to-brand-coral/10 border border-white/50 flex flex-col gap-2.5"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🎉</span>
              <p className="text-sm font-bold font-title text-brand-dark">
                ¡Has aprendido {vocabCount} {vocabCount === 1 ? "frase nueva" : "frases nuevas"}!
              </p>
            </div>
            {teaserText && (
              <div className="flex items-start gap-2.5">
                <span className="text-xl">🔮</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <b className="text-brand-majorelle">Mañana:</b> {teaserText}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🔥</span>
              <p className="text-xs text-slate-600">¡Vuelve mañana para no perder tu racha!</p>
            </div>
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
            {nextLesson ? "¡Hecho! Nos vemos mañana 🐱🔥" : "¡Listo! Yallah 🐱🔥"}
          </button>
        </div>
      </div>
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
                  ? "bg-gradient-to-r from-brand-saffron via-brand-coral to-brand-rose shadow-[0_0_8px_rgba(255,107,107,0.5)]"
                  : i === currentIdx
                  ? "bg-brand-coral/40"
                  : "bg-slate-200/70"
              }`}
            />
          ))}
        </div>

        {/* Lives */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold font-title flex-shrink-0 ${
          localLives > 2 ? "bg-rose-50 text-rose-400" : "bg-red-100 text-red-500 animate-pulse"
        }`}>
          <Heart className={`w-3.5 h-3.5 ${localLives > 0 ? "fill-current" : ""}`} />
          {localLives}
        </div>
      </header>

      {/* Meshi strip */}
      <section className="px-3 pt-2 pb-1.5 flex-shrink-0">
        <div className="glass rounded-2xl px-2 py-1 flex items-center overflow-hidden">
          <Meshi mood={meshiMood} size={60} showBubble={true} bubbleText={meshiSpeech} interactive={false} />
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
                    animate={{ scale: [0, 1.35, 1], rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 14 }}
                    className="flex-shrink-0"
                  >
                    <CheckCircle2 className="w-7 h-7 text-emerald-500 fill-emerald-100" />
                  </motion.div>
                  <div>
                    <p className="font-bold font-title text-emerald-700 text-base leading-tight">¡Correcto!</p>
                    <p className="text-xs text-emerald-600 mt-0.5">¡Sigue así!</p>
                  </div>
                  <motion.span
                    initial={{ opacity: 0, y: 0, scale: 0.6 }}
                    animate={{ opacity: [0, 1, 1, 0], y: -28, scale: 1.1 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    className="absolute right-2 top-0 font-extrabold font-title text-emerald-500 text-lg"
                  >
                    +{attempts === 1 ? 10 : 5} XP
                  </motion.span>
                </div>
              ) : (
                <div className="flex items-start gap-2.5">
                  <span className="text-xl flex-shrink-0 mt-0.5">😿</span>
                  <div>
                    <p className="font-bold font-title text-rose-700 text-sm leading-tight">Respuesta correcta:</p>
                    <p className="text-sm font-semibold text-rose-800 mt-0.5">{getCorrectAnswerText() ?? "—"}</p>
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
                  : "bg-slate-200 text-slate-400 cursor-not-allowed border-b-0"
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
