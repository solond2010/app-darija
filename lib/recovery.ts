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
  streak: 3,
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

/**
 * Restore the rescued snapshot if this is an eligible account that still has less
 * progress than the backup. Returns true if progress was restored.
 */
export function restoreLostProgress(email: string | null | undefined): boolean {
  if (!email || !RECOVERY_EMAILS.has(email.toLowerCase())) return false;
  const local = useStore.getState().exportSnapshot();
  if (progressWeight(SARA_BACKUP) <= progressWeight(local)) return false;
  return useStore.getState().mergeCloud(SARA_BACKUP);
}
