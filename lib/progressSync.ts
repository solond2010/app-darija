import { supabase } from "./supabase";
import { useStore, progressWeight } from "./store";
import { restoreLostProgress } from "./recovery";

let currentUserId: string | null = null;
let unsub: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let lastJSON = "";

type PullResult = { ok: boolean; data: Record<string, unknown> | null };

/**
 * Read the cloud copy.
 *  - ok:false  → we could NOT read it (network/RLS error). Callers MUST NOT push
 *                in this case, or they would clobber good cloud data with whatever
 *                this device currently holds (possibly empty).
 *  - ok:true, data:null → genuinely no row yet (safe to push as first backup).
 */
async function pull(userId: string): Promise<PullResult> {
  const { data, error } = await supabase
    .from("progress")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.warn("progress pull:", error.message);
    return { ok: false, data: null };
  }
  return { ok: true, data: (data?.data as Record<string, unknown>) ?? null };
}

async function push(userId: string) {
  const snap = useStore.getState().exportSnapshot();
  const json = JSON.stringify({ ...snap, savedAt: undefined });
  if (json === lastJSON) return;

  // SAFETY: never overwrite a heavier cloud copy with a lighter local one.
  // If we can't verify the cloud, do NOT write (prevents wiping good progress
  // after a failed read). If the cloud is ahead, restore it locally instead.
  const cloud = await pull(userId);
  if (!cloud.ok) return;
  if (cloud.data && progressWeight(cloud.data) > progressWeight(snap)) {
    useStore.getState().mergeCloud(cloud.data);
    return;
  }

  const { error } = await supabase
    .from("progress")
    .upsert({ user_id: userId, data: snap, updated_at: new Date().toISOString() });
  if (error) console.warn("progress push:", error.message);
  else lastJSON = json;
}

function schedule() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    if (currentUserId) push(currentUserId);
  }, 2000);
}

function onHide() {
  if (currentUserId && document.visibilityState === "hidden") push(currentUserId);
}
function onPageHide() {
  if (currentUserId) push(currentUserId);
}

/**
 * Begin syncing the logged-in user's progress with Supabase.
 * - Pulls the cloud copy and restores it if it has MORE progress than this device.
 * - Then pushes the local copy up (migrates existing localStorage progress into
 *   the account the first time, and backs it up afterwards on every change).
 */
export async function startSync(userId: string) {
  if (currentUserId === userId) return;
  await stopSync();
  currentUserId = userId;

  const cloud = await pull(userId);
  const store = useStore.getState();

  if (cloud.ok && cloud.data) {
    const localWeight = progressWeight(store.exportSnapshot());
    if (localWeight === 0) {
      // Local state is empty/default (first launch or cache cleared).
      // Cloud is the source of truth — overwrite unconditionally.
      store.cloudHydrate(cloud.data);
    } else {
      // Both local and cloud have data. MergeCloud keeps the heavier copy
      // (cloud wins when it has more progress, local wins if the user has
      // been playing offline and hasn't synced yet).
      store.mergeCloud(cloud.data);
    }
  }

  // Restore from the embedded backup if this account was affected by the old
  // sync bug. Runs EVEN IF the cloud read failed, so a transient network error
  // never prevents the rescue.
  const { data: u } = await supabase.auth.getUser();
  const recovered = restoreLostProgress(u.user?.email);

  // If the backup was just restored, push it to the cloud immediately.
  if (recovered && cloud.ok) {
    lastJSON = "";
    await push(userId);
  }

  // Only back up to the cloud if we could actually READ it first. After a failed
  // read we must not push, or an empty/evicted device would wipe the account.
  if (cloud.ok) {
    lastJSON = "";
    await push(userId);
  }

  // Re-check streak AFTER cloud data was merged (the initial check in AppInit
  // runs before cloud sync and would miss the restored values).
  useStore.getState().updateStreakDaily();

  unsub = useStore.subscribe(schedule);
  window.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", onPageHide);
}

/** Push the current local progress to the account right now (e.g. after a manual import). */
export function flushNow() {
  if (currentUserId) {
    lastJSON = "";
    push(currentUserId);
  }
}

export async function stopSync() {
  if (unsub) { unsub(); unsub = null; }
  if (timer) { clearTimeout(timer); timer = null; }
  window.removeEventListener("visibilitychange", onHide);
  window.removeEventListener("pagehide", onPageHide);
  currentUserId = null;
  lastJSON = "";
}
