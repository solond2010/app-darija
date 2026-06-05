import { Unit } from "../data/lessons";

export interface FlatLesson {
  id: string;
  title: string;
  unitId: string;
  emoji: string;
  index: number;
}

// Person who builds the lessons (shown across the app so Sara knows Amin made it).
export const CREATOR_NAME = "Amin";

function flatten(units: Unit[]): FlatLesson[] {
  const flat: FlatLesson[] = [];
  units.forEach((u) =>
    u.lessons.forEach((l) =>
      flat.push({ id: l.id, title: l.title, unitId: u.id, emoji: u.emoji, index: flat.length })
    )
  );
  return flat;
}

/**
 * Lessons that are "new for this learner": ones she has NOT completed but that sit
 * BEHIND her furthest-completed lesson (i.e. inserted into a part of the course she
 * already passed). No manual flag needed — any lesson Amin adds anywhere is detected
 * automatically and surfaced as NEW until she does it.
 */
export function getNewLessons(
  units: Unit[],
  completed: string[],
  unlockedUnits: string[]
): FlatLesson[] {
  const flat = flatten(units);
  const completedIdx = flat.filter((f) => completed.includes(f.id)).map((f) => f.index);
  if (completedIdx.length === 0) return [];
  const maxCompleted = Math.max(...completedIdx);
  return flat.filter(
    (f) =>
      !completed.includes(f.id) &&
      f.index < maxCompleted &&
      unlockedUnits.includes(f.unitId)
  );
}

/** Quick lookup set of new-lesson ids. */
export function newLessonIds(
  units: Unit[],
  completed: string[],
  unlockedUnits: string[]
): Set<string> {
  return new Set(getNewLessons(units, completed, unlockedUnits).map((l) => l.id));
}
