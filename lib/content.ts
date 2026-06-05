import { create } from "zustand";
import { unitsData as defaultUnits, Unit, CONTENT_DATE } from "../data/lessons";
import { lessonVocabulary as defaultVocab } from "../data/vocabulary";
import { LearnedWord } from "./store";
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
export const useContent = create<ContentState>((set) => ({
  units: defaultUnits,
  vocabulary: defaultVocab,
  loaded: false,
  setContent: (units, vocabulary) => set({ units, vocabulary, loaded: true }),
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

/**
 * Code-authoritative merge: the bundled code curriculum wins for existing units
 * and lessons (so curriculum improvements ship), while any lessons/units the admin
 * ADDED via the editor (present only in the cloud) are still kept.
 */
function mergeCodeWins(base: Unit[], cloud: Unit[]): Unit[] {
  const cloudById = new Map(cloud.map((u) => [u.id, u]));
  const baseIds = new Set(base.map((u) => u.id));
  const result: Unit[] = base.map((bu) => {
    const cu = cloudById.get(bu.id);
    if (!cu) return bu;
    const baseLessonIds = new Set(bu.lessons.map((l) => l.id));
    const adminAdded = (cu.lessons || []).filter((cl) => !baseLessonIds.has(cl.id));
    return adminAdded.length ? { ...bu, lessons: [...bu.lessons, ...adminAdded] } : bu;
  });
  cloud.forEach((cu) => {
    if (!baseIds.has(cu.id)) result.push(cu);
  });
  return result;
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
      const savedAt = data.updated_at ? Date.parse(data.updated_at as string) : 0;
      const codeAt = Date.parse(CONTENT_DATE);
      // Newest wins: if the code curriculum was updated more recently than the last
      // cloud save, the code wins; otherwise the admin's saved edits win.
      const codeWins = codeAt > savedAt;
      const cloudUnits = data.units as Unit[];
      const cloudVocab = (data.vocabulary as Vocabulary) ?? {};
      const mergedUnits = codeWins
        ? mergeCodeWins(defaultUnits, cloudUnits)
        : mergeUnits(defaultUnits, cloudUnits);
      const mergedVocab: Vocabulary = codeWins
        ? { ...cloudVocab, ...defaultVocab } // code vocab wins
        : { ...defaultVocab, ...cloudVocab }; // cloud vocab wins
      useContent.getState().setContent(mergedUnits, mergedVocab);
    }
  } catch {
    /* non-critical: keep defaults */
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
