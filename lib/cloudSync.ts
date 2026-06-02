import { useStore } from "./store";

let started = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let lastSavedJSON = "";

async function pushToCloud() {
  const snapshot = useStore.getState().exportSnapshot();
  const json = JSON.stringify({ ...snapshot, savedAt: undefined });
  if (json === lastSavedJSON) return; // nothing changed
  try {
    const res = await fetch("/api/progress/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
    if (res.ok) lastSavedJSON = json;
  } catch {
    /* offline / non-critical — local copy is still safe */
  }
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(pushToCloud, 2500);
}

/**
 * Pull the cloud backup on launch and, if it has MORE progress than this
 * device, restore it. Then keep the cloud copy in sync with every change.
 * Safe to call many times; only the first call wires things up.
 */
export async function initCloudSync() {
  if (started || typeof window === "undefined") return;
  started = true;

  const userName = useStore.getState().userName || "sara";

  // 1. Pull on launch
  try {
    const res = await fetch(`/api/progress/load?user=${encodeURIComponent(userName)}`);
    const data = await res.json();
    if (data?.snapshot) {
      const restored = useStore.getState().mergeCloud(data.snapshot);
      if (restored) {
        lastSavedJSON = JSON.stringify({ ...useStore.getState().exportSnapshot(), savedAt: undefined });
      }
    }
  } catch {
    /* non-critical */
  }

  // 2. Back up whatever progress this device already has, right away.
  //    (If the cloud was empty/behind, this captures the local progress on
  //    first launch even if the user does nothing else this session.)
  scheduleSave();

  // 3. Keep cloud in sync going forward (debounced)
  useStore.subscribe(scheduleSave);

  // 4. Flush on tab hide / close so nothing is lost
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") pushToCloud();
  });
  window.addEventListener("pagehide", pushToCloud);
}

/** Force an immediate save (used after manual import). */
export function flushCloud() {
  lastSavedJSON = "";
  pushToCloud();
}
