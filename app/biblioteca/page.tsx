"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronDown, Search, BookOpen, Layers, ListChecks, Sparkles, Check,
} from "lucide-react";
import { Exercise } from "../../data/lessons";
import { useContent } from "../../lib/content";

const TYPE_LABELS: Record<string, string> = {
  "multiple-choice": "Opción múltiple",
  translation: "Traducción",
  "match-pairs": "Emparejar",
  "fill-blank": "Rellenar hueco",
  "word-order": "Ordenar palabras",
  "listening-select": "Escuchar y elegir",
  "true-false": "Verdadero/Falso",
  "flashcard-reveal": "Tarjeta",
  conversation: "Conversación",
};

function ExerciseCard({ ex }: { ex: Exercise }) {
  const answer = ex.answer;
  const isCorrect = (opt: string) =>
    Array.isArray(answer) ? answer.includes(opt) : answer === opt;

  return (
    <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-brand-beige p-3.5 flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-majorelle/15 text-brand-majorelle">
          {TYPE_LABELS[ex.type] ?? ex.type}
        </span>
        <span className="text-[10px] text-slate-400 font-mono">{ex.id}</span>
      </div>

      {ex.question && <p className="text-sm font-semibold text-brand-dark">{ex.question}</p>}
      {ex.sentenceWithBlank && (
        <p className="text-sm text-slate-600 italic">“{ex.sentenceWithBlank}”</p>
      )}
      {(ex.audioText || ex.front) && (
        <p className="text-sm font-bold text-brand-coral">{ex.audioText ?? ex.front}</p>
      )}
      {ex.back && <p className="text-sm text-slate-600">→ {ex.back}</p>}

      {/* Options with the correct one highlighted */}
      {ex.options && (
        <div className="flex flex-wrap gap-1.5">
          {ex.options.map((opt, i) => (
            <span
              key={i}
              className={`text-[11px] px-2 py-1 rounded-lg border ${
                isCorrect(opt)
                  ? "bg-brand-teal/15 border-brand-teal/40 text-brand-teal font-bold"
                  : "bg-slate-50 border-brand-beige text-slate-500"
              }`}
            >
              {isCorrect(opt) && <Check className="inline w-3 h-3 mr-0.5" />}
              {opt}
            </span>
          ))}
        </div>
      )}

      {/* Pairs */}
      {ex.pairs && (
        <div className="flex flex-col gap-1">
          {ex.pairs.map((p, i) => (
            <div key={i} className="text-[11px] text-slate-600 flex items-center gap-2">
              <span className="font-bold text-brand-coral">{p.left}</span>
              <span className="text-slate-300">↔</span>
              <span>{p.right}</span>
            </div>
          ))}
        </div>
      )}

      {/* Word order answer */}
      {ex.orderedAnswer && (
        <p className="text-[11px] text-brand-teal font-bold">
          ✓ {ex.orderedAnswer.join(" ")}
        </p>
      )}

      {/* Translation / true-false answer */}
      {typeof answer === "boolean" && (
        <p className="text-[11px] text-brand-teal font-bold">✓ {answer ? "Verdadero" : "Falso"}</p>
      )}
      {ex.type === "translation" && Array.isArray(answer) && (
        <p className="text-[11px] text-brand-teal font-bold">✓ {answer.join(" / ")}</p>
      )}

      {/* Dialogue */}
      {ex.dialogue && (
        <div className="flex flex-col gap-1 mt-1">
          {ex.dialogue.map((d, i) => (
            <p key={i} className="text-[11px] text-slate-600">
              <span className={`font-bold ${d.speaker === "Meshi" ? "text-brand-coral" : "text-brand-majorelle"}`}>
                {d.speaker}:
              </span>{" "}
              {d.text}
              {d.answer && <span className="text-brand-teal font-bold"> (✓ {d.answer})</span>}
            </p>
          ))}
        </div>
      )}

      {ex.hint && <p className="text-[10px] text-slate-400 italic">💡 {ex.hint}</p>}
    </div>
  );
}

export default function BibliotecaPage() {
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({ "unidad-1": true });
  const [openLessons, setOpenLessons] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const unitsData = useContent((s) => s.units);
  const lessonVocabulary = useContent((s) => s.vocabulary);

  const stats = useMemo(() => {
    let lessons = 0, exercises = 0, words = 0;
    unitsData.forEach((u) => {
      lessons += u.lessons.length;
      u.lessons.forEach((l) => {
        exercises += l.exercises.length;
        words += lessonVocabulary[l.id]?.length ?? 0;
      });
    });
    return { units: unitsData.length, lessons, exercises, words };
  }, [unitsData, lessonVocabulary]);

  const q = query.trim().toLowerCase();
  const matchesLesson = (lessonId: string, title: string, desc: string) => {
    if (!q) return true;
    if (title.toLowerCase().includes(q) || desc.toLowerCase().includes(q)) return true;
    const exMatch = unitsData
      .flatMap((u) => u.lessons)
      .find((l) => l.id === lessonId)
      ?.exercises.some((e) => JSON.stringify(e).toLowerCase().includes(q));
    const vocabMatch = lessonVocabulary[lessonId]?.some(
      (w) => w.darija.toLowerCase().includes(q) || w.spanish.toLowerCase().includes(q)
    );
    return Boolean(exMatch || vocabMatch);
  };

  const toggleUnit = (id: string) => setOpenUnits((s) => ({ ...s, [id]: !s[id] }));
  const toggleLesson = (id: string) => setOpenLessons((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div className="min-h-screen pb-16 flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <header className="sticky top-0 h-14 glass border-b border-white/40 flex items-center gap-3 px-4 z-40">
        <Link href="/perfil" className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-coral hover:bg-brand-coral/10 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4.5 h-4.5 text-brand-coral" />
          <h1 className="font-extrabold font-title text-gradient text-lg">Biblioteca</h1>
        </div>
      </header>

      <main className="flex-1 px-4 pt-3 flex flex-col gap-3">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Unidades", value: stats.units, icon: Layers },
            { label: "Lecciones", value: stats.lessons, icon: BookOpen },
            { label: "Ejercicios", value: stats.exercises, icon: ListChecks },
            { label: "Palabras", value: stats.words, icon: Sparkles },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="glass rounded-2xl p-2.5 flex flex-col items-center text-center gap-0.5">
                <Icon className="w-4 h-4 text-brand-coral" />
                <span className="text-lg font-bold font-title text-brand-dark leading-none">{s.value}</span>
                <span className="text-[8px] uppercase tracking-wide text-slate-400 font-bold">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="glass rounded-2xl px-3 py-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar palabra, frase o lección…"
            className="flex-1 bg-transparent text-sm text-brand-dark placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Units */}
        {unitsData.map((unit) => {
          const visibleLessons = unit.lessons.filter((l) =>
            matchesLesson(l.id, l.title, l.description)
          );
          if (q && visibleLessons.length === 0) return null;
          const unitOpen = openUnits[unit.id] || Boolean(q);

          return (
            <div key={unit.id} className="glass rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleUnit(unit.id)}
                className="w-full flex items-center gap-3 p-3.5 text-left"
              >
                <span className="text-xl">{unit.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Unidad {unit.number}</p>
                  <p className="text-sm font-bold font-title text-brand-dark truncate">{unit.title}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${unitOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence initial={false}>
                {unitOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="px-3 pb-3 flex flex-col gap-2"
                  >
                    {visibleLessons.map((lesson) => {
                      const lessonOpen = openLessons[lesson.id] || Boolean(q);
                      const vocab = lessonVocabulary[lesson.id] ?? [];
                      return (
                        <div key={lesson.id} className="rounded-xl border border-brand-beige overflow-hidden bg-white/40 dark:bg-white/5">
                          <button
                            onClick={() => toggleLesson(lesson.id)}
                            className="w-full flex items-center gap-2 p-3 text-left"
                          >
                            <span className="text-[10px] font-mono text-brand-coral font-bold flex-shrink-0">{lesson.id}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-brand-dark truncate">{lesson.title}</p>
                              <p className="text-[10px] text-slate-400">{lesson.exercises.length} ejercicios · {vocab.length} palabras</p>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${lessonOpen ? "rotate-180" : ""}`} />
                          </button>

                          {lessonOpen && (
                            <div className="px-3 pb-3 flex flex-col gap-2">
                              <p className="text-[11px] text-slate-500 italic">{lesson.description}</p>
                              {lesson.exercises.map((ex) => (
                                <ExerciseCard key={ex.id} ex={ex} />
                              ))}
                              {vocab.length > 0 && (
                                <div className="rounded-2xl bg-brand-saffron/10 border border-brand-saffron/30 p-3 mt-1">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-saffron mb-2">Vocabulario ({vocab.length})</p>
                                  <div className="flex flex-col gap-1">
                                    {vocab.map((w, i) => (
                                      <div key={i} className="text-[11px] flex items-baseline gap-2">
                                        <span className="font-bold text-brand-coral flex-shrink-0">{w.darija}</span>
                                        <span className="text-slate-500">{w.spanish}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        <p className="text-center text-[10px] text-slate-400 pt-2 pb-4">
          Vista de administración · contenido completo de Meshi
        </p>
      </main>
    </div>
  );
}
