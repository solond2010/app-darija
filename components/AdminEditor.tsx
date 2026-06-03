"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronDown, Plus, Trash2, Save, Check, Eye,
} from "lucide-react";
import { useContent, saveContent, Vocabulary } from "../lib/content";
import { Unit, Exercise } from "../data/lessons";

const TYPES: { value: Exercise["type"]; label: string }[] = [
  { value: "multiple-choice", label: "Opción múltiple" },
  { value: "true-false", label: "Verdadero / Falso" },
  { value: "translation", label: "Traducción" },
  { value: "fill-blank", label: "Rellenar hueco" },
  { value: "match-pairs", label: "Emparejar" },
  { value: "word-order", label: "Ordenar palabras" },
  { value: "listening-select", label: "Escuchar y elegir" },
  { value: "flashcard-reveal", label: "Tarjeta (flashcard)" },
  { value: "conversation", label: "Conversación" },
];

function blankExercise(type: Exercise["type"], id: string): Exercise {
  switch (type) {
    case "multiple-choice": return { id, type, question: "", options: ["", ""], answer: "", hint: "" };
    case "true-false": return { id, type, question: "", answer: true, hint: "" };
    case "translation": return { id, type, question: "", answer: [""], translation: "", hint: "" };
    case "fill-blank": return { id, type, question: "", sentenceWithBlank: "", options: ["", ""], answer: "", hint: "" };
    case "match-pairs": return { id, type, question: "", pairs: [{ left: "", right: "" }] };
    case "word-order": return { id, type, question: "", words: [""], orderedAnswer: [""] };
    case "listening-select": return { id, type, question: "", audioText: "", options: ["", ""], answer: "", hint: "" };
    case "flashcard-reveal": return { id, type, front: "", back: "", hint: "" };
    case "conversation": return { id, type, question: "", dialogue: [{ speaker: "Meshi", text: "" }] };
    default: return { id, type };
  }
}

/* ── small inputs ── */
const inputCls =
  "w-full text-sm rounded-lg border-2 border-brand-beige bg-white/70 px-2.5 py-1.5 text-brand-dark focus:outline-none focus:border-brand-coral";

function Field({ label, value, onChange, area }: { label: string; value: string; onChange: (v: string) => void; area?: boolean }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      {area ? (
        <textarea className={inputCls} rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function StringList({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input className={inputCls} value={it} onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }} />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])} className="text-[11px] text-brand-coral font-bold flex items-center gap-1 self-start"><Plus className="w-3.5 h-3.5" /> añadir</button>
    </div>
  );
}

export const AdminEditor: React.FC = () => {
  const storeUnits = useContent((s) => s.units);
  const storeVocab = useContent((s) => s.vocabulary);
  const loaded = useContent((s) => s.loaded);

  const [units, setUnits] = useState<Unit[]>([]);
  const [vocab, setVocab] = useState<Vocabulary>({});
  const [openU, setOpenU] = useState<Record<string, boolean>>({});
  const [openL, setOpenL] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Seed the editable copy once content is ready (DB or defaults).
  useEffect(() => {
    if (!initialized) {
      setUnits(structuredClone(storeUnits));
      setVocab(structuredClone(storeVocab));
      setInitialized(true);
    }
  }, [storeUnits, storeVocab, initialized]);

  const mutate = (fn: (u: Unit[]) => void) => {
    const next = structuredClone(units);
    fn(next);
    setUnits(next);
    setDirty(true);
    setSaved(false);
  };
  const mutateVocab = (fn: (v: Vocabulary) => void) => {
    const next = structuredClone(vocab);
    fn(next);
    setVocab(next);
    setDirty(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const err = await saveContent(units, vocab);
    setSaving(false);
    if (err) {
      alert("Error al guardar: " + err.message + "\n\n¿Has iniciado sesión con la cuenta admin?");
    } else {
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  if (!loaded && !initialized) {
    return <div className="p-8 text-center text-slate-400">Cargando contenido…</div>;
  }

  return (
    <div className="min-h-screen pb-28 flex flex-col max-w-md mx-auto relative">
      <header className="sticky top-0 h-14 glass border-b border-white/40 flex items-center gap-3 px-4 z-40">
        <Link href="/perfil" className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-coral hover:bg-brand-coral/10">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-extrabold font-title text-gradient text-lg flex-1">Editor</h1>
        <Link href="/biblioteca" className="text-slate-400 hover:text-brand-coral p-1.5"><Eye className="w-4.5 h-4.5" /></Link>
      </header>

      <main className="flex-1 px-3 pt-3 flex flex-col gap-3">
        <p className="text-[11px] text-slate-500 px-1">
          Edita unidades, lecciones, ejercicios y vocabulario. Pulsa <b>Guardar</b> y los cambios se aplican en la app al instante.
        </p>

        {units.map((unit, ui) => {
          const uOpen = openU[unit.id];
          return (
            <div key={unit.id} className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 p-3">
                <button onClick={() => setOpenU((s) => ({ ...s, [unit.id]: !s[unit.id] }))} className="flex items-center gap-2 flex-1 text-left min-w-0">
                  <span className="text-xl">{unit.emoji || "📘"}</span>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Unidad {unit.number}</p>
                    <p className="text-sm font-bold font-title text-brand-dark truncate">{unit.title || "(sin título)"}</p>
                  </div>
                </button>
                <button onClick={() => { if (confirm("¿Borrar toda la unidad?")) mutate((u) => { u.splice(ui, 1); }); }} className="text-rose-400 p-1.5"><Trash2 className="w-4 h-4" /></button>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${uOpen ? "rotate-180" : ""}`} />
              </div>

              {uOpen && (
                <div className="px-3 pb-3 flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Emoji" value={unit.emoji} onChange={(v) => mutate((u) => { u[ui].emoji = v; })} />
                    <Field label="Nº" value={String(unit.number)} onChange={(v) => mutate((u) => { u[ui].number = Number(v) || 0; })} />
                  </div>
                  <Field label="ID (ej. unidad-3)" value={unit.id} onChange={(v) => mutate((u) => { u[ui].id = v; })} />
                  <Field label="Título" value={unit.title} onChange={(v) => mutate((u) => { u[ui].title = v; })} />
                  <Field label="Descripción" area value={unit.description} onChange={(v) => mutate((u) => { u[ui].description = v; })} />

                  {/* Lessons */}
                  {unit.lessons.map((lesson, li) => {
                    const lOpen = openL[lesson.id];
                    const lv = vocab[lesson.id] ?? [];
                    return (
                      <div key={li} className="rounded-xl border border-brand-beige bg-white/40 overflow-hidden">
                        <div className="flex items-center gap-2 p-2.5">
                          <button onClick={() => setOpenL((s) => ({ ...s, [lesson.id]: !s[lesson.id] }))} className="flex items-center gap-2 flex-1 text-left min-w-0">
                            <span className="text-[10px] font-mono text-brand-coral font-bold">{lesson.id}</span>
                            <span className="text-sm font-semibold text-brand-dark truncate">{lesson.title || "(lección)"}</span>
                          </button>
                          <button onClick={() => { if (confirm("¿Borrar lección?")) mutate((u) => { u[ui].lessons.splice(li, 1); }); }} className="text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${lOpen ? "rotate-180" : ""}`} />
                        </div>

                        {lOpen && (
                          <div className="px-2.5 pb-2.5 flex flex-col gap-2">
                            <Field label="ID lección (ej. 3.2)" value={lesson.id} onChange={(v) => mutate((u) => { u[ui].lessons[li].id = v; })} />
                            <Field label="Título" value={lesson.title} onChange={(v) => mutate((u) => { u[ui].lessons[li].title = v; })} />
                            <Field label="Descripción" area value={lesson.description} onChange={(v) => mutate((u) => { u[ui].lessons[li].description = v; })} />

                            {/* Exercises */}
                            <p className="text-[10px] font-bold uppercase tracking-wide text-brand-majorelle mt-1">Ejercicios ({lesson.exercises.length})</p>
                            {lesson.exercises.map((ex, ei) => (
                              <ExerciseForm
                                key={ei}
                                ex={ex}
                                onChange={(nx) => mutate((u) => { u[ui].lessons[li].exercises[ei] = nx; })}
                                onDelete={() => mutate((u) => { u[ui].lessons[li].exercises.splice(ei, 1); })}
                              />
                            ))}
                            <button
                              onClick={() => mutate((u) => {
                                const n = u[ui].lessons[li].exercises.length + 1;
                                u[ui].lessons[li].exercises.push(blankExercise("multiple-choice", `${lesson.id}.${n}`));
                              })}
                              className="btn-3d-gray py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                            ><Plus className="w-3.5 h-3.5" /> Añadir ejercicio</button>

                            {/* Vocabulary */}
                            <p className="text-[10px] font-bold uppercase tracking-wide text-brand-saffron mt-2">Vocabulario ({lv.length})</p>
                            {lv.map((w, wi) => (
                              <div key={wi} className="flex items-center gap-1.5">
                                <input className={inputCls} placeholder="Darija" value={w.darija} onChange={(e) => mutateVocab((v) => { v[lesson.id][wi].darija = e.target.value; })} />
                                <input className={inputCls} placeholder="Español" value={w.spanish} onChange={(e) => mutateVocab((v) => { v[lesson.id][wi].spanish = e.target.value; })} />
                                <button onClick={() => mutateVocab((v) => { v[lesson.id].splice(wi, 1); })} className="text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            ))}
                            <button
                              onClick={() => mutateVocab((v) => { if (!v[lesson.id]) v[lesson.id] = []; v[lesson.id].push({ darija: "", spanish: "", category: lesson.title }); })}
                              className="text-[11px] text-brand-saffron font-bold flex items-center gap-1 self-start"
                            ><Plus className="w-3.5 h-3.5" /> añadir palabra</button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <button
                    onClick={() => mutate((u) => {
                      const n = u[ui].lessons.length + 1;
                      u[ui].lessons.push({ id: `${unit.number}.${n}`, title: "Nueva lección", description: "", exercises: [] });
                    })}
                    className="btn-3d-secondary py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                  ><Plus className="w-3.5 h-3.5" /> Añadir lección</button>
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={() => mutate((u) => {
            const num = u.length + 1;
            u.push({ id: `unidad-${num}`, number: num, title: "Nueva unidad", emoji: "📘", description: "", lessons: [] });
          })}
          className="btn-3d-gray py-2.5 text-sm font-bold flex items-center justify-center gap-1.5"
        ><Plus className="w-4 h-4" /> Añadir unidad</button>
      </main>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-3 glass-strong border-t border-white/40 z-40">
        <button
          onClick={handleSave}
          disabled={saving || (!dirty && !saved)}
          className="btn-3d-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saved ? <><Check className="w-4 h-4" /> ¡Guardado!</> : saving ? "Guardando…" : <><Save className="w-4 h-4" /> Guardar cambios</>}
        </button>
      </div>
    </div>
  );
};

/* ── Exercise form (per type) ── */
function ExerciseForm({ ex, onChange, onDelete }: { ex: Exercise; onChange: (e: Exercise) => void; onDelete: () => void }) {
  const set = (patch: Partial<Exercise>) => onChange({ ...ex, ...patch });
  const options = ex.options ?? [];

  return (
    <div className="rounded-xl bg-white/60 border border-brand-beige p-2.5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <select
          className={inputCls + " flex-1"}
          value={ex.type}
          onChange={(e) => onChange(blankExercise(e.target.value as Exercise["type"], ex.id))}
        >
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <button onClick={onDelete} className="text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>

      {/* question / prompt for most types */}
      {ex.type !== "flashcard-reveal" && (
        <Field label="Pregunta / enunciado" area value={ex.question ?? ""} onChange={(v) => set({ question: v })} />
      )}

      {ex.type === "flashcard-reveal" && (
        <>
          <Field label="Frente (Darija)" value={ex.front ?? ""} onChange={(v) => set({ front: v })} />
          <Field label="Reverso (significado)" value={ex.back ?? ""} onChange={(v) => set({ back: v })} />
        </>
      )}

      {ex.type === "fill-blank" && (
        <Field label="Frase con hueco (usa ___)" value={ex.sentenceWithBlank ?? ""} onChange={(v) => set({ sentenceWithBlank: v })} />
      )}

      {ex.type === "listening-select" && (
        <Field label="Texto a 'escuchar' (transliteración)" value={ex.audioText ?? ""} onChange={(v) => set({ audioText: v })} />
      )}

      {/* options + correct answer */}
      {(ex.type === "multiple-choice" || ex.type === "fill-blank" || ex.type === "listening-select") && (
        <>
          <StringList label="Opciones" items={options} onChange={(v) => set({ options: v })} />
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Respuesta correcta</span>
            <select className={inputCls} value={(ex.answer as string) ?? ""} onChange={(e) => set({ answer: e.target.value })}>
              <option value="">— elige —</option>
              {options.map((o, i) => <option key={i} value={o}>{o || "(vacío)"}</option>)}
            </select>
          </label>
        </>
      )}

      {ex.type === "true-false" && (
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Respuesta correcta</span>
          <select className={inputCls} value={ex.answer ? "true" : "false"} onChange={(e) => set({ answer: e.target.value === "true" })}>
            <option value="true">Verdadero</option>
            <option value="false">Falso</option>
          </select>
        </label>
      )}

      {ex.type === "translation" && (
        <StringList label="Respuestas aceptadas" items={(ex.answer as string[]) ?? [""]} onChange={(v) => set({ answer: v })} />
      )}

      {ex.type === "word-order" && (
        <>
          <StringList label="Palabras (desordenadas)" items={ex.words ?? [""]} onChange={(v) => set({ words: v })} />
          <StringList label="Orden correcto" items={ex.orderedAnswer ?? [""]} onChange={(v) => set({ orderedAnswer: v })} />
        </>
      )}

      {ex.type === "match-pairs" && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Parejas</span>
          {(ex.pairs ?? []).map((p, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input className={inputCls} placeholder="Darija" value={p.left} onChange={(e) => { const n = [...(ex.pairs ?? [])]; n[i] = { ...n[i], left: e.target.value }; set({ pairs: n }); }} />
              <input className={inputCls} placeholder="Español" value={p.right} onChange={(e) => { const n = [...(ex.pairs ?? [])]; n[i] = { ...n[i], right: e.target.value }; set({ pairs: n }); }} />
              <button onClick={() => set({ pairs: (ex.pairs ?? []).filter((_, j) => j !== i) })} className="text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button onClick={() => set({ pairs: [...(ex.pairs ?? []), { left: "", right: "" }] })} className="text-[11px] text-brand-coral font-bold flex items-center gap-1 self-start"><Plus className="w-3.5 h-3.5" /> añadir pareja</button>
        </div>
      )}

      {ex.type === "conversation" && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Diálogo</span>
          {(ex.dialogue ?? []).map((d, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <select className={inputCls + " max-w-[90px]"} value={d.speaker} onChange={(e) => { const n = [...(ex.dialogue ?? [])]; n[i] = { ...n[i], speaker: e.target.value as "Meshi" | "Sara" }; set({ dialogue: n }); }}>
                <option value="Meshi">Meshi</option>
                <option value="Sara">Sara</option>
              </select>
              <input className={inputCls} placeholder="Texto" value={d.text} onChange={(e) => { const n = [...(ex.dialogue ?? [])]; n[i] = { ...n[i], text: e.target.value }; set({ dialogue: n }); }} />
              <button onClick={() => set({ dialogue: (ex.dialogue ?? []).filter((_, j) => j !== i) })} className="text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button onClick={() => set({ dialogue: [...(ex.dialogue ?? []), { speaker: "Meshi", text: "" }] })} className="text-[11px] text-brand-coral font-bold flex items-center gap-1 self-start"><Plus className="w-3.5 h-3.5" /> añadir línea</button>
        </div>
      )}

      {ex.type !== "match-pairs" && ex.type !== "conversation" && (
        <Field label="Pista (opcional)" value={ex.hint ?? ""} onChange={(v) => set({ hint: v })} />
      )}
    </div>
  );
}
