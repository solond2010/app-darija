import { create } from "zustand";

export type Celebration =
  | { kind: "level"; level: number; name: string }
  | { kind: "achievement"; emoji: string; title: string; message: string }
  | { kind: "streak"; days: number };

interface CelebrationState {
  queue: Celebration[];
  push: (items: Celebration[]) => void;
  dismiss: () => void;
}

// Global queue so any screen can fire full-screen celebrations, shown one by one.
export const useCelebration = create<CelebrationState>((set) => ({
  queue: [],
  push: (items) => set((s) => ({ queue: [...s.queue, ...items] })),
  dismiss: () => set((s) => ({ queue: s.queue.slice(1) })),
}));
