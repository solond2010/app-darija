import { create } from "zustand";
import { unitsData as defaultUnits, Unit } from "../data/lessons";
import { lessonVocabulary as defaultVocab } from "../data/vocabulary";
import { LearnedWord } from "./store";
import { withUnitReviews, withRecycling } from "./unitReview";
import { supabase } from "./supabase";

export type Vocabulary = Record<string, LearnedWord[]>;

interface ContentState {
  units: Unit[];
  vocabulary: Vocabulary;
  loaded: boolean;
  setContent: (units: Unit[], vocabulary: Vocabulary) => void;
}

/**
 * Lesson content store. Initialized with the bundled defaults (so the app works
 * instantly and offline), then overwritten with the admin-edited content from
 * Supabase once it loads.
 */
// Drop "listen & type" exercises (writing what a TTS voice says) — the audio is
// not reliable enough for them to be fair. Lessons left empty are removed.
function stripListenType(units: Unit[]): Unit[] {
  return units
    .map((u) => ({
      ...u,
      lessons: u.lessons
        .map((l) => ({ ...l, exercises: (l.exercises || []).filter((e) => e.type !== "listen-type") }))
        .filter((l) => l.isReview || (l.exercises && l.exercises.length > 0)),
    }))
    .filter((u) => u.lessons.length > 0);
}

// Process raw units: drop listen-type, recycle words from previous lessons into
// each lesson, then append the auto-generated end-of-unit review lessons.
function processUnits(units: Unit[], vocab: Vocabulary): Unit[] {
  return withUnitReviews(withRecycling(stripListenType(units), vocab), vocab);
}

export const useContent = create<ContentState>((set) => ({
  units: processUnits(defaultUnits, defaultVocab),
  vocabulary: defaultVocab,
  loaded: false,
  setContent: (units, vocabulary) =>
    set({ units: processUnits(units, vocabulary), vocabulary, loaded: true }),
}));

/**
 * Merge cloud (admin-edited) content over the bundled code defaults.
 *  - Admin edits to EXISTING units/lessons win (so the no-code editor keeps working).
 *  - NEW lessons/units shipped in code (e.g. a new exercise type) are always
 *    included, even if the saved cloud snapshot predates them.
 *  - Admin-ADDED units/lessons (only in the cloud) are kept too.
 */
function mergeUnits(base: Unit[], cloud: Unit[]): Unit[] {
  const cloudById = new Map(cloud.map((u) => [u.id, u]));
  const baseIds = new Set(base.map((u) => u.id));

  const merged: Unit[] = base.map((bu) => {
    const cu = cloudById.get(bu.id);
    if (!cu) return bu; // brand-new unit from code
    const cloudLessonById = new Map((cu.lessons || []).map((l) => [l.id, l]));
    const baseLessonIds = new Set(bu.lessons.map((l) => l.id));
    // base order + cloud overrides for existing lessons + new code lessons
    const lessons = bu.lessons.map((bl) => cloudLessonById.get(bl.id) ?? bl);
    // keep any admin-added lessons that don't exist in code
    (cu.lessons || []).forEach((cl) => {
      if (!baseLessonIds.has(cl.id)) lessons.push(cl);
    });
    return { ...cu, lessons }; // cloud unit meta wins, lessons merged
  });

  // append any admin-added units not present in code
  cloud.forEach((cu) => {
    if (!baseIds.has(cu.id)) merged.push(cu);
  });
  return merged;
}

/** Fetch admin-edited content from Supabase (if any) and merge it with defaults. */
export async function loadContent() {
  try {
    const { data, error } = await supabase
      .from("app_content")
      .select("units,vocabulary,updated_at")
      .eq("id", "main")
      .maybeSingle();
    if (!error && data && Array.isArray(data.units) && data.units.length > 0) {
      const cloudUnits = data.units as Unit[];
      const cloudVocab = (data.vocabulary as Vocabulary) ?? {};
      // Always merge cloud (admin-edited) content over the bundled defaults so
      // that edits made via the no-code editor are never silently discarded, even
      // if the code curriculum was updated more recently.
      useContent.getState().setContent(
        mergeUnits(defaultUnits, cloudUnits),
        { ...defaultVocab, ...cloudVocab }
      );
    } else {
      // No cloud row (or empty): defaults ARE the content. Mark loaded so the
      // editor and lesson pages can proceed.
      useContent.getState().setContent(defaultUnits, defaultVocab);
    }
  } catch {
    // Network error: keep defaults but mark loaded so the editor isn't stuck.
    if (!useContent.getState().loaded) {
      useContent.getState().setContent(defaultUnits, defaultVocab);
    }
  }
}

/** Save edited content to Supabase (admin only, enforced by RLS) and apply locally. */
export async function saveContent(units: Unit[], vocabulary: Vocabulary) {
  const { error } = await supabase
    .from("app_content")
    .upsert({ id: "main", units, vocabulary, updated_at: new Date().toISOString() });
  if (!error) useContent.getState().setContent(units, vocabulary);
  return error;
}
