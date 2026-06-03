import { create } from "zustand";
import { unitsData as defaultUnits, Unit } from "../data/lessons";
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

/** Fetch admin-edited content from Supabase (if any) and apply it. */
export async function loadContent() {
  try {
    const { data, error } = await supabase
      .from("app_content")
      .select("units,vocabulary")
      .eq("id", "main")
      .maybeSingle();
    if (!error && data && Array.isArray(data.units) && data.units.length > 0) {
      useContent.getState().setContent(data.units as Unit[], (data.vocabulary as Vocabulary) ?? {});
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
