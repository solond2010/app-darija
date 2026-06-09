import { Unit, Lesson, Exercise } from "../data/lessons";
import type { LearnedWord } from "./store";

type Vocab = Record<string, LearnedWord[]>;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick `n` distractor values (by `key`) from the pool, excluding the correct one.
function distractors(pool: LearnedWord[], correct: LearnedWord, n: number, key: "darija" | "spanish"): string[] {
  const seen = new Set<string>([correct[key]]);
  const out: string[] = [];
  for (const w of shuffle(pool)) {
    if (out.length >= n) break;
    if (!seen.has(w[key])) {
      seen.add(w[key]);
      out.push(w[key]);
    }
  }
  return out;
}

/** Auto-generate a "review" lesson for a unit from all its vocabulary. */
export function buildUnitReview(unit: Unit, words: LearnedWord[]): Lesson | null {
  if (words.length < 4) return null;
  const pool = words;
  const ex: Exercise[] = [];
  const ordered = shuffle(words);
  let p = 0;
  const nextWord = () => ordered[p++ % ordered.length];

  // match-pairs (4 words)
  const matchSet = shuffle(words).slice(0, 4);
  ex.push({
    id: `${unit.number}.R.1`,
    type: "match-pairs",
    question: "Une cada palabra con su significado:",
    pairs: matchSet.map((w) => ({ left: w.darija, right: w.spanish })),
  });

  // flashcard
  const f1 = nextWord();
  ex.push({ id: `${unit.number}.R.2`, type: "flashcard-reveal", question: "Recuerda esta palabra:", front: f1.darija, back: f1.spanish });

  // darija → español
  const m1 = nextWord();
  ex.push({
    id: `${unit.number}.R.3`,
    type: "multiple-choice",
    question: `¿Qué significa '${m1.darija}'?`,
    options: shuffle([m1.spanish, ...distractors(pool, m1, 3, "spanish")]),
    answer: m1.spanish,
  });

  // español → darija
  const m2 = nextWord();
  ex.push({
    id: `${unit.number}.R.4`,
    type: "multiple-choice",
    question: `¿Cómo se dice '${m2.spanish}' en Darija?`,
    options: shuffle([m2.darija, ...distractors(pool, m2, 3, "darija")]),
    answer: m2.darija,
  });

  // listening-select (hear the darija, pick the meaning)
  const l1 = nextWord();
  ex.push({
    id: `${unit.number}.R.5`,
    type: "listening-select",
    question: "Escucha y elige el significado:",
    audioText: l1.darija,
    options: shuffle([l1.spanish, ...distractors(pool, l1, 3, "spanish")]),
    answer: l1.spanish,
  });

  // darija → español
  const m3 = nextWord();
  ex.push({
    id: `${unit.number}.R.6`,
    type: "multiple-choice",
    question: `¿Qué significa '${m3.darija}'?`,
    options: shuffle([m3.spanish, ...distractors(pool, m3, 3, "spanish")]),
    answer: m3.spanish,
  });

  // flashcard
  const f2 = nextWord();
  ex.push({ id: `${unit.number}.R.7`, type: "flashcard-reveal", question: "Recuerda esta palabra:", front: f2.darija, back: f2.spanish });

  // español → darija
  const m4 = nextWord();
  ex.push({
    id: `${unit.number}.R.8`,
    type: "multiple-choice",
    question: `¿Cómo se dice '${m4.spanish}' en Darija?`,
    options: shuffle([m4.darija, ...distractors(pool, m4, 3, "darija")]),
    answer: m4.darija,
  });

  // second match-pairs if there are enough distinct words
  if (words.length >= 8) {
    const matchSet2 = shuffle(words).slice(0, 4);
    ex.push({
      id: `${unit.number}.R.9`,
      type: "match-pairs",
      question: "Une cada palabra con su significado:",
      pairs: matchSet2.map((w) => ({ left: w.darija, right: w.spanish })),
    });
  }

  // listening-select
  const l2 = nextWord();
  ex.push({
    id: `${unit.number}.R.10`,
    type: "listening-select",
    question: "Escucha y elige el significado:",
    audioText: l2.darija,
    options: shuffle([l2.spanish, ...distractors(pool, l2, 3, "spanish")]),
    answer: l2.spanish,
  });

  return {
    id: `${unit.number}.R`,
    title: `Repaso de la Unidad ${unit.number} 🔁`,
    description: `Repasa todo lo aprendido en "${unit.title}" para que no se te olvide.`,
    isReview: true,
    exercises: ex,
  };
}

// One or two "recycle" exercises that re-test words from the previous lesson(s),
// so each new word keeps coming back in the next lessons with different exercises.
function buildRecycleExercises(lessonId: string, sources: LearnedWord[][]): Exercise[] {
  const pool = sources.flat();
  if (pool.length < 2) return [];
  const out: Exercise[] = [];
  sources.slice(0, 2).forEach((words, k) => {
    if (!words || words.length === 0) return;
    const w = shuffle(words)[0];
    const opts = shuffle([w.spanish, ...distractors(pool, w, 3, "spanish")]);
    if (opts.length < 2) return;
    if (k % 2 === 0) {
      out.push({
        id: `${lessonId}.rc${k + 1}`,
        type: "multiple-choice",
        question: `🔁 ¿Qué significa '${w.darija}'?`,
        options: opts,
        answer: w.spanish,
      });
    } else {
      out.push({
        id: `${lessonId}.rc${k + 1}`,
        type: "listening-select",
        question: "🔁 Escucha y elige el significado:",
        audioText: w.darija,
        options: opts,
        answer: w.spanish,
      });
    }
  });
  return out;
}

/**
 * Append a couple of recycling exercises to each lesson, drawn from the previous
 * 1-2 lessons' vocabulary — so words learned keep reappearing. Idempotent.
 */
export function withRecycling(units: Unit[], vocab: Vocab): Unit[] {
  const flat: string[] = [];
  units.forEach((u) => u.lessons.forEach((l) => { if (!l.isReview) flat.push(l.id); }));
  const idxOf = new Map(flat.map((id, i) => [id, i]));

  return units.map((u) => ({
    ...u,
    lessons: u.lessons.map((l) => {
      if (l.isReview) return l;
      if (l.exercises.some((e) => e.id.includes(".rc"))) return l; // already recycled
      const i = idxOf.get(l.id) ?? 0;
      if (i < 1) return l; // very first lesson — nothing earlier to recycle
      const sources: LearnedWord[][] = [];
      if (flat[i - 1]) sources.push(vocab[flat[i - 1]] || []);
      if (flat[i - 2]) sources.push(vocab[flat[i - 2]] || []);
      const recycled = buildRecycleExercises(l.id, sources);
      return recycled.length ? { ...l, exercises: [...l.exercises, ...recycled] } : l;
    }),
  }));
}

/** Append an auto-generated review lesson to the end of every unit. Idempotent. */
export function withUnitReviews(units: Unit[], vocab: Vocab): Unit[] {
  return units.map((u) => {
    if (u.lessons.some((l) => l.isReview)) return u; // already has a review
    const all = u.lessons.flatMap((l) => vocab[l.id] || []);
    const seen = new Set<string>();
    const uniq = all.filter((w) => {
      const k = w.darija.toLowerCase().trim();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const review = buildUnitReview(u, uniq);
    return review ? { ...u, lessons: [...u.lessons, review] } : u;
  });
}
