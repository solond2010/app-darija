import { create } from "zustand";

export interface LevelUpInfo {
  level: number;
  name: string;
}

interface CelebrationState {
  levelUp: LevelUpInfo | null;
  triggerLevelUp: (info: LevelUpInfo) => void;
  clear: () => void;
}

// Tiny global store so any screen can fire a full-screen celebration.
export const useCelebration = create<CelebrationState>((set) => ({
  levelUp: null,
  triggerLevelUp: (info) => set({ levelUp: info }),
  clear: () => set({ levelUp: null }),
}));
