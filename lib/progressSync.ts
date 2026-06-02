import { supabase } from "./supabase";
import { useStore } from "./store";

let currentUserId: string | null = null;
let unsub: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let lastJSON = "";

async function pull(userId: string) {
  const { data, error } = await supabase
    .from("progress")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.warn("progress pull:", error.message);
    return null;
  }
  return (data?.data as Record<string, unknown>) ?? null;
}

async function push(userId: string) {
  const snap = useStore.getState().exportSnapshot();
  const json = JSON.stringify({ ...snap, savedAt: undefined });
  if (json === lastJSON) return;
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
  if (cloud) useStore.getState().mergeCloud(cloud);

  // Always make sure the cloud holds at least what this device has.
  lastJSON = "";
  await push(userId);

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
