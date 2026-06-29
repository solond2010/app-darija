"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useContent } from "../../lib/content";
import { Header } from "../../components/Header";
import { Meshi } from "../../components/Suki";
import { SpeakButton } from "../../components/SpeakButton";
import { useStore, LearnedWord } from "../../lib/store";
import { Search, Check, Info, BookOpen, AlertCircle, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const categoryEmoji: Record<string, string> = {
  "Todos": "📚", "Saludos": "👋", "Pronombres": "🧑", "Presentación": "🙋",
  "Sentimientos": "💭", "Modificadores": "⚡", "Preguntas": "❓", "Familia": "👨‍👩‍👧",
  "Casa": "🏠", "Frases": "💬", "Preposiciones": "🔗", "Comida": "🍵",
  "Verbos": "⚡", "Colores": "🎨", "Ropa": "👗", "Números": "🔢",
  "Ciudad": "🕌", "Tiempo": "🕐", "Futuro": "🚀", "Expresiones": "✨",
};

export default function DiccionarioPage() {
  const { learnedWords, isHydrated, setHydrated } = useStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const vocabulary = useContent((s) => s.vocabulary);

  // Build the glossary from the live (admin-editable) content, deduped by word.
  const allVocab = useMemo(() => {
    const out: (LearnedWord & { lessonId: string })[] = [];
    const seen = new Set<string>();
    for (const [lessonId, words] of Object.entries(vocabulary)) {
      for (const w of words) {
        const key = w.darija.toLowerCase().trim();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ ...w, lessonId });
      }
    }
    return out;
  }, [vocabulary]);

  useEffect(() => {
    setHydrated(true);
    setMounted(true);
  }, [setHydrated]);

  if (!mounted || !isHydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-slate-400 font-title font-medium text-sm">Cargando...</p>
      </div>
    );
  }

  const categories = ["Todos", ...Array.from(new Set(allVocab.map((v) => v.category)))];

  const hasLearnedWord = (word: string) =>
    learnedWords.some(
      (w) => w.darija.toLowerCase().split("/")[0].trim() === word.toLowerCase().split("/")[0].trim()
    );

  const filteredVocabulary = allVocab.filter((v) => {
    const matchCat = selectedCategory === "Todos" || v.category === selectedCategory;
    const matchSearch =
      v.darija.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.spanish.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const learnedCount = filteredVocabulary.filter((v) => hasLearnedWord(v.darija)).length;

  return (
    <div className="min-h-screen pb-20 flex flex-col max-w-md mx-auto relative overflow-hidden">
      <Header />

      <main className="flex-1 px-4 pt-3 flex flex-col gap-3 overflow-y-auto no-scrollbar pb-6">

        {/* Meshi bubble */}
        <section className="glass rounded-3xl px-3 py-2.5 flex items-center mt-1 overflow-hidden">
          <Meshi
            mood="normal"
            size={80}
            showBubble={true}
            bubbleText="¡Sara! Cada palabra se desbloquea cuando la aprendes en una lección. 🐱🔓"
          />
        </section>

        {/* Stats strip */}
        <div className="flex gap-2">
          <div className="flex-1 glass rounded-2xl px-3 py-2.5 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-coral flex-shrink-0" />
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Total</p>
              <p className="text-sm font-bold font-title text-brand-dark leading-none">{allVocab.length} palabras</p>
            </div>
          </div>
          <div className="flex-1 glass rounded-2xl px-3 py-2.5 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Aprendidas</p>
              <p className="text-sm font-bold font-title text-brand-dark leading-none">{learnedWords.length}</p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en Darija o Español..."
            className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-md border-2 border-white/80 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-coral shadow-sm transition-colors text-brand-dark"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const emoji = categoryEmoji[cat] ?? "📝";
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1 py-1.5 px-2.5 rounded-full text-xs font-title font-bold transition-all flex-shrink-0 border ${
                  isActive
                    ? "bg-gradient-to-br from-brand-saffron to-brand-coral border-brand-coral/60 text-white glow-coral"
                    : "bg-white/70 backdrop-blur-md border-white/80 text-slate-500"
                }`}
              >
                <span className="text-sm leading-none">{emoji}</span>
                {cat}
              </button>
            );
          })}
        </div>

        {/* Vocabulary cards */}
        <div className="flex flex-col gap-2.5">
          {filteredVocabulary.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 glass rounded-3xl text-center gap-2">
              <AlertCircle className="w-8 h-8 text-slate-300" />
              <h5 className="font-bold text-sm text-brand-dark font-title">Sin resultados</h5>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                No encontramos palabras para esta búsqueda. ¡Prueba otra!
              </p>
            </div>
          ) : (
            filteredVocabulary.map((word, idx) => {
              const learned = hasLearnedWord(word.darija);

              // Locked word: not learned yet. Hide the word + translation so the
              // glossary unlocks as Sara completes lessons.
              if (!learned) {
                return (
                  <div
                    key={idx}
                    className="glass rounded-2xl overflow-hidden px-4 py-3.5 flex items-center gap-3 opacity-90"
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-dark/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-3.5 w-28 max-w-[55%] rounded-full bg-slate-200/80" />
                      <p className="text-[11px] font-semibold text-slate-400 mt-1.5">
                        Aprende la lección {word.lessonId} para desbloquearla
                      </p>
                    </div>
                    <span className="bg-slate-50 text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-100 flex-shrink-0">
                      Bloqueada
                    </span>
                  </div>
                );
              }

              const isExpanded = expandedIdx === idx;
              return (
                <motion.div
                  key={idx}
                  layout
                  className="glass rounded-2xl overflow-hidden transition-all cursor-pointer ring-1 ring-brand-teal/40"
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                >
                  {/* Card header - always visible */}
                  <div className="px-4 pt-3.5 pb-3 flex items-center gap-3 border-l-[3px] border-l-brand-mint">
                    <SpeakButton text={word.darija} size={20} className="p-2 bg-brand-pink/15 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold font-title text-brand-dark truncate">
                        {word.darija}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
                        {word.spanish}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        Aprendida
                      </span>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      }
                    </div>
                  </div>

                  {/* Expandable details */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-brand-cream/80 pt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-brand-coral bg-brand-pink/15 px-2 py-0.5 rounded-full">
                              {word.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              · Lección {word.lessonId}
                            </span>
                          </div>
                          {word.example && (
                            <div className="flex items-start gap-2 bg-brand-cream/60 rounded-xl p-2.5 text-[11px] text-slate-600 italic leading-relaxed">
                              <Info className="w-3.5 h-3.5 text-brand-coral flex-shrink-0 mt-0.5" />
                              <span>{word.example}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </main>

    </div>
  );
}
