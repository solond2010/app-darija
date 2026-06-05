import { Unit } from "../data/lessons";

export interface FlatLesson {
  id: string;
  title: string;
  unitId: string;
  emoji: string;
  index: number;
  addedAt?: string;
}

// Person who builds the lessons (shown across the app so Sara knows Amin made it).
export const CREATOR_NAME = "Amin";

// A lesson is flagged "NUEVO" only for this long after Amin added it — after that
// it's no longer new, so the badge and the home banner disappear on their own.
export const NEW_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours

function flatten(units: Unit[]): FlatLesson[] {
  const flat: FlatLesson[] = [];
  units.forEach((u) =>
    u.lessons.forEach((l) =>
      flat.push({
        id: l.id,
        title: l.title,
        unitId: u.id,
        emoji: u.emoji,
        index: flat.length,
        addedAt: l.addedAt,
      })
    )
  );
  return flat;
}

/**
 * Lessons that are "new" right now: added by Amin within the last 48h, still
 * unlocked and not yet completed. After 48h they stop being flagged automatically
 * (no longer new). No manual cleanup needed.
 */
export function getNewLessons(
  units: Unit[],
  completed: string[],
  unlockedUnits: string[]
): FlatLesson[] {
  const now = Date.now();
  return flatten(units).filter((f) => {
    if (!f.addedAt) return false;
    const age = now - Date.parse(f.addedAt);
    if (isNaN(age) || age < 0 || age > NEW_WINDOW_MS) return false; // outside the 48h window
    if (completed.includes(f.id)) return false;
    if (!unlockedUnits.includes(f.unitId)) return false;
    return true;
  });
}

/** Quick lookup set of new-lesson ids. */
export function newLessonIds(
  units: Unit[],
  completed: string[],
  unlockedUnits: string[]
): Set<string> {
  return new Set(getNewLessons(units, completed, unlockedUnits).map((l) => l.id));
}
