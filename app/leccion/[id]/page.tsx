"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore, LearnedWord } from "../../../lib/store";
import { unitsData, Exercise } from "../../../data/lessons";
import { getRandomMessage } from "../../../data/meshi-messages";
import { Meshi, MeshiMood } from "../../../components/Suki";
import { ExerciseRenderer } from "../../../components/ExerciseTypes/ExerciseRenderer";
import { sound } from "../../../utils/sound";
import { Heart, X, Sparkles, Star, Flame, Trophy, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { lessonVocabulary } from "../../../data/vocabulary";

export default function LeccionPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const { lives, decrementLive, refillLives, addXP, completeLesson, addLearnedWords, soundsEnabled } = useStore();

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

  useEffect(() => {
    setLocalLives(useStore.getState().lives);
    let found: any = null;
    unitsData.forEach((u) => {
      const m = u.lessons.find((l) => l.id === lessonId);
      if (m) found = m;
    });
    if (found) {
      setLesson(found);
      setMeshiSpeech(`¡Yallah Sara! Vamos a empezar la lección ${lessonId}. 🐱`);
    } else {
      router.push("/");
    }
  }, [lessonId, router]);

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
  const progressPercent = (currentIdx / lesson.exercises.length) * 100;

  const getCorrectAnswerText = (): string | null => {
    if (!currentExercise) return null;
    const t = currentExercise.type;
    if (["multiple-choice", "fill-blank", "listening-select", "conversation"].includes(t))
      return currentExercise.answer as string;
    if (t === "translation") return (currentExercise.answer as string[])[0];
    if (t === "word-order") return currentExercise.orderedAnswer?.join(" ") ?? null;
    if (t === "true-false") return (currentExercise.answer as boolean) ? "Verdadero ✓" : "Falso ✗";
    return null;
  };

  const handleCheck = (directAnswer?: boolean) => {
    const ans = directAnswer !== undefined ? directAnswer : selectedAns;
    if (directAnswer !== undefined) setSelectedAns(directAnswer);

    let correct = false;
    const t = currentExercise.type;

    if (["multiple-choice", "fill-blank", "listening-select", "conversation"].includes(t)) {
      correct = ans === currentExercise.answer;
    } else if (t === "translation") {
      const norm = (s: string) =>
        s.toLowerCase().trim()
          .normalize("NFD").replace(/[̀-ͯ]/g, "")
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡]/g, "");
      correct = (currentExercise.answer as string[]).some((a) => norm(ans || "") === norm(a));
    } else if (t === "match-pairs") {
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
      setTotalXPEarned((p) => p + (attempts === 1 ? 10 : 5));
      setMeshiMood("celebrating");
      setMeshiSpeech(getRandomMessage("correct").text);
    } else {
      if (soundsEnabled) sound.playIncorrect();
      decrementLive();
      setLocalLives((p) => Math.max(0, p - 1));
      setErrorsCount((p) => p + 1);
      setMeshiMood("sad");
      setMeshiSpeech(getRandomMessage("incorrect").text);
      if (attempts === 1) {
        setAttempts(2);
        setSelectedAns(null);
      } else {
        setAttempts(3);
      }
    }
  };

  const handleContinue = () => {
    if (meshiMood === "sad" && attempts === 2 && isAnswerChecked) {
      if (localLives <= 0) { setIsLessonFinished(true); return; }
      setIsAnswerChecked(false);
      setLastAnswerCorrect(null);
      setSelectedAns(null);
      setMeshiMood("thinking");
      setMeshiSpeech("¡Tú puedes Sara! Vamos a intentarlo otra vez. 💪");
      return;
    }
    setAttempts(1);
    setIsAnswerChecked(false);
    setLastAnswerCorrect(null);
    setSelectedAns(null);
    setMeshiMood("normal");
    setMeshiSpeech(getRandomMessage("greetings").text);

    if (currentIdx < lesson.exercises.length - 1) {
      setCurrentIdx((p) => p + 1);
    } else {
      handleLessonCompletion();
    }
  };

  const handleLessonCompletion = () => {
    setIsLessonFinished(true);
    const gotPerfect = errorsCount === 0;
    const { achievementsUnlocked } = completeLesson(lessonId, gotPerfect);
    setUnlockedBadges(achievementsUnlocked);
    addXP(gotPerfect ? 150 + totalXPEarned : 50 + totalXPEarned);
    const words = lessonVocabulary[lessonId];
    if (words) addLearnedWords(words);
    if (gotPerfect) {
      if (soundsEnabled) sound.playFanfare();
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.55 } });
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

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="glass rounded-2xl p-4 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">XP Ganado</span>
              <span className="text-xl font-bold font-title text-brand-dark mt-0.5">+{totalXP}</span>
            </div>
            <div className="glass rounded-2xl p-4 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-brand-pink/15 flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-brand-coral" />
              </div>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Precisión</span>
              <span className="text-xl font-bold font-title text-brand-dark mt-0.5">{accuracy}%</span>
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
              Vocabulario aprendido (+{lessonVocabulary[lessonId]?.length ?? 0} palabras)
            </h4>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
              {lessonVocabulary[lessonId]?.map((v, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-brand-cream last:border-none text-xs">
                  <span className="font-bold text-brand-coral">{v.darija}</span>
                  <span className="text-slate-400 font-medium">{v.spanish}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Fixed footer CTA */}
        <div className="flex-shrink-0 px-5 pb-6 pt-3 glass border-t border-white/40">
          <button
            onClick={() => {
              useStore.getState().incrementStreak();
              router.push("/");
            }}
            className="w-full py-4 btn-3d-primary font-title text-base"
          >
            ¡Listo! Yallah 🐱🔥
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

        {/* Progress bar */}
        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            layout
            className="h-full bg-gradient-to-r from-brand-saffron via-brand-coral to-brand-rose rounded-full"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35 }}
          />
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

      {/* Exercise area */}
      <main className="flex-1 min-h-0 px-4 py-3 flex flex-col justify-center items-center overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
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
        </AnimatePresence>
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-5 pt-4 pb-1"
            >
              {lastAnswerCorrect ? (
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100 flex-shrink-0" />
                  <div>
                    <p className="font-bold font-title text-emerald-700 text-base leading-tight">¡Correcto!</p>
                    <p className="text-xs text-emerald-600 mt-0.5">+{attempts === 1 ? 10 : 5} XP · ¡Sigue así!</p>
                  </div>
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

        <div className="p-4">
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
              className={`w-full py-4 rounded-2xl font-title text-base text-center transition-all ${
                (currentExercise.type === "flashcard-reveal"
                  ? isCardFlipped
                  : selectedAns !== null && (!Array.isArray(selectedAns) || selectedAns.length > 0))
                  ? "btn-3d-primary"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed border-b-0"
              }`}
            >
              {currentExercise.type === "flashcard-reveal" ? "Girar carta 🔄" : "Comprobar"}
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className={`w-full py-4 rounded-2xl font-title text-base text-center ${
                lastAnswerCorrect ? "btn-3d-mint" : "btn-3d-primary"
              }`}
            >
              {attempts === 2 && !lastAnswerCorrect ? "Intentar de nuevo 💪" : "Continuar →"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
