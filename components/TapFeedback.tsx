"use client";

import { useEffect } from "react";
import { sound } from "../utils/sound";
import { useStore } from "../lib/store";

/**
 * Global tap feedback: a soft click sound whenever any interactive element is
 * pressed anywhere in the app. Makes it feel alive. (Most buttons already add
 * their own haptics, so we only add sound here to avoid double vibration.)
 */
export function TapFeedback() {
  const soundsEnabled = useStore((s) => s.soundsEnabled);

  useEffect(() => {
    const onDown = (e: Event) => {
      const t = e.target as HTMLElement | null;
      const el = t?.closest('button, a, [role="button"], label, summary');
      if (!el) return;
      if (soundsEnabled) sound.playSelect();
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [soundsEnabled]);

  return null;
}

export default TapFeedback;
