import { create } from "zustand";
import { persist } from "zustand/middleware";
import { achievementsData } from "../data/achievements";

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
  completeLesson: (lessonId: string, gotPerfect: boolean) => { achievementsUnlocked: string[] };
  addLearnedWords: (words: LearnedWord[]) => void;
  toggleSounds: () => void;
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
    return { level: 3, name: "Amiga de la familia 💛", min: 1500, max: 3000 };
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

      completeLesson: (lessonId, gotPerfect) => {
        const state = get();
        const newlyUnlocked: string[] = [];

        const unitNumber = Math.floor(parseFloat(lessonId));
        const unitId = `unidad-${unitNumber}`;

        const alreadyCompleted = state.completedLessons.includes(lessonId);
        const updatedCompleted = alreadyCompleted
          ? state.completedLessons
          : [...state.completedLessons, lessonId];

        const updatedUnlockedUnits = [...state.unlockedUnits];

        if (unitId === "unidad-1" && updatedCompleted.includes("1.1") && updatedCompleted.includes("1.2") && updatedCompleted.includes("1.3")) {
          if (!updatedUnlockedUnits.includes("unidad-2")) updatedUnlockedUnits.push("unidad-2");
        } else if (unitId === "unidad-2" && updatedCompleted.includes("2.1") && updatedCompleted.includes("2.2")) {
          if (!updatedUnlockedUnits.includes("unidad-3")) updatedUnlockedUnits.push("unidad-3");
        } else if (unitId === "unidad-3" && updatedCompleted.includes("3.1")) {
          if (!updatedUnlockedUnits.includes("unidad-4")) updatedUnlockedUnits.push("unidad-4");
        } else if (unitId === "unidad-4" && updatedCompleted.includes("4.1") && updatedCompleted.includes("4.2")) {
          if (!updatedUnlockedUnits.includes("unidad-5")) updatedUnlockedUnits.push("unidad-5");
        } else if (unitId === "unidad-5" && updatedCompleted.includes("5.1") && updatedCompleted.includes("5.2")) {
          if (!updatedUnlockedUnits.includes("unidad-6")) updatedUnlockedUnits.push("unidad-6");
        } else if (unitId === "unidad-6" && updatedCompleted.includes("6.1") && updatedCompleted.includes("6.2")) {
          if (!updatedUnlockedUnits.includes("unidad-7")) updatedUnlockedUnits.push("unidad-7");
        } else if (unitId === "unidad-7" && updatedCompleted.includes("7.1") && updatedCompleted.includes("7.2")) {
          if (!updatedUnlockedUnits.includes("unidad-8")) updatedUnlockedUnits.push("unidad-8");
        } else if (unitId === "unidad-8" && updatedCompleted.includes("8.1") && updatedCompleted.includes("8.2")) {
          if (!updatedUnlockedUnits.includes("unidad-9")) updatedUnlockedUnits.push("unidad-9");
        } else if (unitId === "unidad-9" && updatedCompleted.includes("9.1") && updatedCompleted.includes("9.2")) {
          if (!updatedUnlockedUnits.includes("unidad-10")) updatedUnlockedUnits.push("unidad-10");
        } else if (unitId === "unidad-10" && updatedCompleted.includes("10.1") && updatedCompleted.includes("10.2")) {
          if (!updatedUnlockedUnits.includes("unidad-11")) updatedUnlockedUnits.push("unidad-11");
        }

        // ---- Achievements ----
        if (!state.unlockedAchievements.includes("first_lesson")) {
          newlyUnlocked.push("first_lesson");
        }
        if (gotPerfect && !state.unlockedAchievements.includes("perfect_lesson")) {
          newlyUnlocked.push("perfect_lesson");
        }
        if (unitId === "unidad-1" && updatedCompleted.includes("1.1") && updatedCompleted.includes("1.2") && updatedCompleted.includes("1.3") && !state.unlockedAchievements.includes("unit_1_complete")) {
          newlyUnlocked.push("unit_1_complete");
        }
        if (unitId === "unidad-4" && updatedCompleted.includes("4.1") && updatedCompleted.includes("4.2") && !state.unlockedAchievements.includes("yemma_favorite")) {
          newlyUnlocked.push("yemma_favorite");
        }
        if (unitId === "unidad-5" && updatedCompleted.includes("5.1") && updatedCompleted.includes("5.2") && !state.unlockedAchievements.includes("ama_de_casa")) {
          newlyUnlocked.push("ama_de_casa");
        }
        if (unitId === "unidad-6" && updatedCompleted.includes("6.1") && updatedCompleted.includes("6.2") && !state.unlockedAchievements.includes("masterchef_marroqui")) {
          newlyUnlocked.push("masterchef_marroqui");
        }
        if (unitId === "unidad-7" && updatedCompleted.includes("7.1") && updatedCompleted.includes("7.2") && !state.unlockedAchievements.includes("trabajadora_del_ano")) {
          newlyUnlocked.push("trabajadora_del_ano");
        }
        if (unitId === "unidad-8" && updatedCompleted.includes("8.1") && updatedCompleted.includes("8.2") && !state.unlockedAchievements.includes("estilista_del_zoco")) {
          newlyUnlocked.push("estilista_del_zoco");
        }
        if (unitId === "unidad-9" && updatedCompleted.includes("9.1") && updatedCompleted.includes("9.2") && !state.unlockedAchievements.includes("calculadora_humana")) {
          newlyUnlocked.push("calculadora_humana");
        }
        if (unitId === "unidad-10" && updatedCompleted.includes("10.1") && updatedCompleted.includes("10.2") && !state.unlockedAchievements.includes("guia_de_la_medina")) {
          newlyUnlocked.push("guia_de_la_medina");
        }
        if (unitId === "unidad-11" && updatedCompleted.includes("11.1") && updatedCompleted.includes("11.2") && !state.unlockedAchievements.includes("visionaria")) {
          newlyUnlocked.push("visionaria");
        }

        set({
          completedLessons: updatedCompleted,
          unlockedUnits: updatedUnlockedUnits,
          unlockedAchievements: [...state.unlockedAchievements, ...newlyUnlocked],
        });

        return { achievementsUnlocked: newlyUnlocked };
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

      resetProgress: () => {
        set({
          xp: 0,
          streak: 0,
          lives: 5,
          lastActiveDate: null,
          todayXP: 0,
          todayXPDate: null,
          lastLifeLostAt: null,
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
