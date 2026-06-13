import { useStore, progressWeight, ProgressSnapshot } from "./store";

/**
 * One-time progress recovery.
 *
 * Sara's progress was wiped from her account by a sync bug (a failed cloud read
 * followed by a push uploaded an empty device snapshot over her good data). The
 * last known-good copy was rescued from the legacy Edge Config backup and is
 * embedded below so it can be restored straight into her account.
 *
 * This is SELF-DISABLING: it only applies when the account currently holds LESS
 * progress than this snapshot (via mergeCloud, which never lowers progress). Once
 * restored — or once she advances past it — re-running is a harmless no-op, so it
 * can never overwrite newer progress.
 */

// Accounts eligible for this specific recovery (lower-cased emails).
const RECOVERY_EMAILS = new Set(["parratara60@gmail.com"]);

const SARA_BACKUP: ProgressSnapshot = {
  userName: "sara",
  xp: 600,
  streak: 4,
  lives: 5,
  lastActiveDate: "2026-06-02",
  soundsEnabled: true,
  todayXP: 0,
  todayXPDate: null,
  dailyGoal: 20,
  lastLifeLostAt: null,
  completedLessons: ["1.1", "1.2", "1.3", "2.1", "2.2"],
  unlockedUnits: ["unidad-1", "unidad-2", "unidad-3"],
  learnedWords: [],
  unlockedAchievements: ["first_lesson", "unit_1_complete"],
  savedAt: "2026-06-02T21:02:02.121Z",
};

function yesterdayStr(): string {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
}

/**
 * Restore the rescued snapshot if this is an eligible account that still has less
 * progress than the backup. Returns true if progress was restored.
 */
export function restoreLostProgress(email: string | null | undefined): boolean {
  if (!email || !RECOVERY_EMAILS.has(email.toLowerCase())) return false;
  const state = useStore.getState();

  // Full restore: if the backup has more weight than current state, restore
  // everything (lessons, XP, streak, etc.).
  const local = state.exportSnapshot();
  if (progressWeight(SARA_BACKUP) > progressWeight(local)) {
    state.cloudHydrate({ ...SARA_BACKUP, lastActiveDate: yesterdayStr() });
    return true;
  }

  // Partial restore: if she has real progress (XP) but her streak was
  // reset by the sync bug, fix just the streak without touching lessons/XP.
  // Uses a localStorage flag so it only runs ONCE (won't keep overriding).
  if (state.xp > 0 && state.streak < 4) {
    try {
      if (localStorage.getItem("meshi-streak-fixed-v1")) return false;
      localStorage.setItem("meshi-streak-fixed-v1", "1");
    } catch { /* noop */ }
    useStore.setState({ streak: 4, lastActiveDate: yesterdayStr(), streakShields: 1 });
    return true;
  }

  return false;
}
