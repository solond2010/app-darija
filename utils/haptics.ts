// Lightweight haptic feedback (vibration) for that premium, tactile feel.
// No-ops silently on devices/browsers without the Vibration API (e.g. iOS Safari).

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}

export const haptics = {
  tap: () => vibrate(8),
  light: () => vibrate(12),
  medium: () => vibrate(22),
  success: () => vibrate([14, 35, 22]),
  error: () => vibrate([35, 25, 35, 25]),
  celebrate: () => vibrate([18, 40, 18, 40, 70]),
  levelUp: () => vibrate([20, 30, 20, 30, 20, 30, 90]),
};

export default haptics;
