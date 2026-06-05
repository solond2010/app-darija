import { create } from "zustand";
import { persist } from "zustand/middleware";
import { achievementsData } from "../data/achievements";
import type { Unit } from "../data/lessons";

export interface LearnedWord {
  darija: string;
  spanish: string;
  category: string;
  example?: string;
}

export interface AppState {
  // Profile Stats
  userName: string;
  xp: number;
  streak: number;
  lives: number;
  lastActiveDate: string | null; // Format: YYYY-MM-DD
  soundsEnabled: boolean;

  // Daily goal tracking
  todayXP: number;
  todayXPDate: string | null; // Format: YYYY-MM-DD
  dailyGoal: number; // Default: 20 XP

  // XP earned per calendar day (YYYY-MM-DD → xp), for the stats graph
  xpHistory: Record<string, number>;

  // Lives refill timer
  lastLifeLostAt: string | null; // ISO timestamp

  // Progress trackers
  completedLessons: string[]; // List of lesson IDs, e.g. ["1.1", "1.2"]
  unlockedUnits: string[]; // List of unit IDs, e.g. ["unidad-1", "unidad-2"]
  learnedWords: LearnedWord[];
  unlockedAchievements: string[]; // List of achievement IDs

  // Hydration helper
  isHydrated: boolean;
  setHydrated: (val: boolean) => void;

  // Actions
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  decrementLive: () => void;
  refillLives: () => void;
  checkAndRefillLives: () => void;
  completeLesson: (lessonId: string, gotPerfect: boolean, units: Unit[]) => { achievementsUnlocked: string[]; unlockedUnit: { title: string; emoji: string } | null };
  addLearnedWords: (words: LearnedWord[]) => void;
  toggleSounds: () => void;
  setDailyGoal: (goal: number) => void;
  resetProgress: () => void;
  updateStreakDaily: () => void;

  // Backup / restore
  exportSnapshot: () => ProgressSnapshot;
  importSnapshot: (data: Partial<ProgressSnapshot>) => void;
  mergeCloud: (data: Partial<ProgressSnapshot>) => boolean;
}

// Serializable shape of a saved progress (everything except UI-only flags).
export interface ProgressSnapshot {
  userName: string;
  xp: number;
  streak: number;
  lives: number;
  lastActiveDate: string | null;
  soundsEnabled: boolean;
  todayXP: number;
  todayXPDate: string | null;
  dailyGoal: number;
  lastLifeLostAt: string | null;
  xpHistory?: Record<string, number>;
  completedLessons: string[];
  unlockedUnits: string[];
  learnedWords: LearnedWord[];
  unlockedAchievements: string[];
  savedAt: string;
}

/** A rough "how much progress" score, used to decide which copy wins when merging. */
export function progressWeight(s: Partial<ProgressSnapshot>): number {
  return (
    (s.xp ?? 0) * 1000 +
    (s.completedLessons?.length ?? 0) * 100 +
    (s.unlockedAchievements?.length ?? 0) * 10 +
    (s.learnedWords?.length ?? 0)
  );
}

export function getLevelInfo(xp: number) {
  if (xp < 500) {
    return { level: 1, name: "Turista ✈️", min: 0, max: 500 };
  } else if (xp < 1500) {
    return { level: 2, name: "Visitante 🗺️", min: 500, max: 1500 };
  } else if (xp < 3000) {
    return { level: 3, name: "Amiga de la familia 🤍", min: 1500, max: 3000 };
  } else if (xp < 5000) {
    return { level: 4, name: "Tetouaniya 🇲🇦", min: 3000, max: 5000 };
  } else {
    return { level: 5, name: "Darija Boss 👑", min: 5000, max: 10000 };
  }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      userName: "Sara",
      xp: 0,
      streak: 0,
      lives: 5,
      lastActiveDate: null,
      soundsEnabled: true,
      todayXP: 0,
      todayXPDate: null,
      dailyGoal: 20,
      lastLifeLostAt: null,
      xpHistory: {},
      completedLessons: [],
      unlockedUnits: ["unidad-1"],
      learnedWords: [],
      unlockedAchievements: [],
      isHydrated: false,

      setHydrated: (val) => set({ isHydrated: val }),

      addXP: (amount) => {
        set((state) => {
          const today = new Date().toLocaleDateString("en-CA");
          const todayXP =
            state.todayXPDate === today ? state.todayXP + amount : amount;
          const newXP = state.xp + amount;
          const xpHistory = {
            ...state.xpHistory,
            [today]: (state.xpHistory?.[today] ?? 0) + amount,
          };

          // Check for XP-based achievements
          const newlyUnlocked: string[] = [];
          achievementsData.forEach((ach) => {
            if (
              ach.conditionType === "xp" &&
              typeof ach.conditionValue === "number" &&
              newXP >= ach.conditionValue &&
              !state.unlockedAchievements.includes(ach.id)
            ) {
              newlyUnlocked.push(ach.id);
            }
          });

          return {
            xp: newXP,
            todayXP,
            todayXPDate: today,
            xpHistory,
            unlockedAchievements: [...state.unlockedAchievements, ...newlyUnlocked],
          };
        });
      },

      incrementStreak: () => {
        set((state) => {
          const today = new Date().toLocaleDateString("en-CA");
          // Don't double-increment same day
          if (state.lastActiveDate === today) return {};
          const newStreak = state.streak + 1;

          // Check streak-based achievements
          const newlyUnlocked: string[] = [];
          achievementsData.forEach((ach) => {
            if (
              ach.conditionType === "streak" &&
              typeof ach.conditionValue === "number" &&
              newStreak >= ach.conditionValue &&
              !state.unlockedAchievements.includes(ach.id)
            ) {
              newlyUnlocked.push(ach.id);
            }
          });

          return {
            streak: newStreak,
            lastActiveDate: today,
            unlockedAchievements: [...state.unlockedAchievements, ...newlyUnlocked],
          };
        });
      },

      resetStreak: () => set({ streak: 0 }),

      decrementLive: () => {
        set((state) => {
          const newLives = Math.max(0, state.lives - 1);
          return {
            lives: newLives,
            lastLifeLostAt: newLives < 5 ? new Date().toISOString() : state.lastLifeLostAt,
          };
        });
      },

      refillLives: () => set({ lives: 5, lastLifeLostAt: null }),

      checkAndRefillLives: () => {
        set((state) => {
          if (state.lives >= 5 || !state.lastLifeLostAt) return {};

          const now = Date.now();
          const lastLost = new Date(state.lastLifeLostAt).getTime();
          const minutesElapsed = (now - lastLost) / (1000 * 60);
          // 1 life refilled every 30 minutes
          const livesToAdd = Math.min(5 - state.lives, Math.floor(minutesElapsed / 30));

          if (livesToAdd <= 0) return {};

          const newLives = state.lives + livesToAdd;
          // Shift the lastLifeLostAt forward by the consumed periods
          const consumedMs = livesToAdd * 30 * 60 * 1000;
          const newLastLostAt =
            newLives >= 5
              ? null
              : new Date(lastLost + consumedMs).toISOString();

          return { lives: newLives, lastLifeLostAt: newLastLostAt };
        });
      },

      completeLesson: (lessonId, gotPerfect, units) => {
        const state = get();
        const newlyUnlocked: string[] = [];

        const alreadyCompleted = state.completedLessons.includes(lessonId);
        const updatedCompleted = alreadyCompleted
          ? state.completedLessons
          : [...state.completedLessons, lessonId];

        const updatedUnlockedUnits = [...state.unlockedUnits];

        // Find the unit this lesson belongs to, from the live content.
        const safeUnits = Array.isArray(units) ? units : [];
        const unitIndex = safeUnits.findIndex((u) => u.lessons.some((l) => l.id === lessonId));
        const unit = unitIndex >= 0 ? safeUnits[unitIndex] : null;
        const unitFullyDone = unit
          ? unit.lessons.every((l) => updatedCompleted.includes(l.id))
          : false;

        // Unlock the NEXT unit when the current one is fully completed.
        let unlockedUnit: { title: string; emoji: string } | null = null;
        if (unit && unitFullyDone) {
          const next = safeUnits[unitIndex + 1];
          if (next && !updatedUnlockedUnits.includes(next.id)) {
            updatedUnlockedUnits.push(next.id);
            unlockedUnit = { title: next.title, emoji: next.emoji };
          }
        }

        // ---- Achievements ----
        if (!state.unlockedAchievements.includes("first_lesson")) {
          newlyUnlocked.push("first_lesson");
        }
        if (gotPerfect && !state.unlockedAchievements.includes("perfect_lesson")) {
          newlyUnlocked.push("perfect_lesson");
        }

        // Unit-completion achievements, mapped by unit id.
        const UNIT_ACHIEVEMENTS: Record<string, string> = {
          "unidad-1": "unit_1_complete",
          "unidad-4": "yemma_favorite",
          "unidad-5": "ama_de_casa",
          "unidad-6": "masterchef_marroqui",
          "unidad-7": "trabajadora_del_ano",
          "unidad-8": "estilista_del_zoco",
          "unidad-9": "calculadora_humana",
          "unidad-10": "guia_de_la_medina",
          "unidad-11": "visionaria",
        };
        if (unit && unitFullyDone) {
          const ach = UNIT_ACHIEVEMENTS[unit.id];
          if (ach && !state.unlockedAchievements.includes(ach)) newlyUnlocked.push(ach);
        }

        set({
          completedLessons: updatedCompleted,
          unlockedUnits: updatedUnlockedUnits,
          unlockedAchievements: [...state.unlockedAchievements, ...newlyUnlocked],
        });

        return { achievementsUnlocked: newlyUnlocked, unlockedUnit };
      },

      addLearnedWords: (words) => {
        set((state) => {
          const currentWords = [...state.learnedWords];
          words.forEach((newWord) => {
            const exists = currentWords.some(
              (w) => w.darija.toLowerCase() === newWord.darija.toLowerCase()
            );
            if (!exists) currentWords.push(newWord);
          });
          return { learnedWords: currentWords };
        });
      },

      toggleSounds: () => set((state) => ({ soundsEnabled: !state.soundsEnabled })),

      setDailyGoal: (goal) => set({ dailyGoal: Math.max(5, Math.min(100, Math.round(goal))) }),

      resetProgress: () => {
        set({
          xp: 0,
          streak: 0,
          lives: 5,
          lastActiveDate: null,
          todayXP: 0,
          todayXPDate: null,
          lastLifeLostAt: null,
          xpHistory: {},
          completedLessons: [],
          unlockedUnits: ["unidad-1"],
          learnedWords: [],
          unlockedAchievements: [],
        });
      },

      exportSnapshot: () => {
        const s = get();
        return {
          userName: s.userName,
          xp: s.xp,
          streak: s.streak,
          lives: s.lives,
          lastActiveDate: s.lastActiveDate,
          soundsEnabled: s.soundsEnabled,
          todayXP: s.todayXP,
          todayXPDate: s.todayXPDate,
          dailyGoal: s.dailyGoal,
          lastLifeLostAt: s.lastLifeLostAt,
          xpHistory: s.xpHistory ?? {},
          completedLessons: s.completedLessons,
          unlockedUnits: s.unlockedUnits,
          learnedWords: s.learnedWords,
          unlockedAchievements: s.unlockedAchievements,
          savedAt: new Date().toISOString(),
        };
      },

      // Overwrite local progress with an imported snapshot (manual restore).
      importSnapshot: (data) => {
        if (!data || typeof data !== "object") return;
        set((state) => ({
          userName: data.userName ?? state.userName,
          xp: data.xp ?? state.xp,
          streak: data.streak ?? state.streak,
          lives: data.lives ?? state.lives,
          lastActiveDate: data.lastActiveDate ?? state.lastActiveDate,
          soundsEnabled: data.soundsEnabled ?? state.soundsEnabled,
          todayXP: data.todayXP ?? state.todayXP,
          todayXPDate: data.todayXPDate ?? state.todayXPDate,
          dailyGoal: data.dailyGoal ?? state.dailyGoal,
          lastLifeLostAt: data.lastLifeLostAt ?? state.lastLifeLostAt,
          xpHistory: data.xpHistory ?? state.xpHistory,
          completedLessons: data.completedLessons ?? state.completedLessons,
          unlockedUnits: data.unlockedUnits ?? state.unlockedUnits,
          learnedWords: data.learnedWords ?? state.learnedWords,
          unlockedAchievements: data.unlockedAchievements ?? state.unlockedAchievements,
        }));
      },

      // Restore from cloud ONLY if the cloud copy has more progress than local.
      // Returns true if local state was replaced. Prevents an empty/older device
      // from wiping good progress.
      mergeCloud: (data) => {
        if (!data || typeof data !== "object") return false;
        const local = get().exportSnapshot();
        if (progressWeight(data) <= progressWeight(local)) return false;
        get().importSnapshot(data);
        return true;
      },

      updateStreakDaily: () => {
        const state = get();
        if (!state.lastActiveDate) return;

        const todayStr = new Date().toLocaleDateString("en-CA");
        const lastStr = state.lastActiveDate;

        if (todayStr === lastStr) return;

        const [ly, lm, ld] = lastStr.split("-").map(Number);
        const [ty, tm, td] = todayStr.split("-").map(Number);
        const lastLocal = new Date(ly, lm - 1, ld);
        const todayLocal = new Date(ty, tm - 1, td);
        const diffDays = Math.round((todayLocal.getTime() - lastLocal.getTime()) / 86400000);

        if (diffDays > 1) {
          set({ streak: 0 });
        }
      },
    }),
    {
      name: "meshi-darija-progress",
      partialize: (state) => {
        const { isHydrated, ...rest } = state;
        return rest;
      },
    }
  )
);
