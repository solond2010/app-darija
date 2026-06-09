"use client";

import { useEffect, useRef } from "react";
import { useStore } from "../lib/store";
import { supabase } from "../lib/supabase";
import { startSync, stopSync } from "../lib/progressSync";
import { loadContent } from "../lib/content";

const VAPID_PUBLIC_KEY =
  "BCBd9pjscuAWjlyF4UygErc_yHEYUbLegVBJDUFszebOeNWZurTNixOJsD27ZO5SxNNwBOLyDdpc4tz4OqvZcas";

async function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

async function registerAndSubscribe() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    // If notifications already granted, make sure we have a subscription
    if (Notification.permission === "granted") {
      const existing = await reg.pushManager.getSubscription();
      if (!existing) {
        const key = await urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        }).catch(() => {});
      } else {
        // Re-sync subscription in case it changed
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(existing.toJSON()),
        }).catch(() => {});
      }
    }
  } catch (e) {
    // Non-critical, silently fail
  }
}

async function syncStatus() {
  const state = useStore.getState();
  const today = new Date().toLocaleDateString("en-CA");
  await fetch("/api/push/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      streak: state.streak,
      lastPlayedDate: state.lastActiveDate,
      playedToday: state.lastActiveDate === today,
    }),
  }).catch(() => {}); // Non-critical
}

/**
 * Runs once on every page mount (via layout.tsx).
 * - Resets streak if missed > 1 day
 * - Registers service worker & re-syncs push subscription
 * - Syncs Sara's play status to server for cron notifications
 */
export function AppInit() {
  const { updateStreakDaily, setHydrated } = useStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    setHydrated(true);
    updateStreakDaily();

    // Service worker + push subscription (non-blocking)
    registerAndSubscribe();

    // Sync play status to server so the daily cron is accurate
    syncStatus();

    // Load admin-edited lesson content from the cloud (falls back to bundled defaults)
    loadContent();

    // Cloud backup via the user's account (Supabase): start syncing whenever
    // there's a session, stop on sign-out. Works app-wide, on any page.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) startSync(data.session.user.id);
    });
    const { data: authSub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) startSync(session.user.id);
      else stopSync();
    });

    // PWA auto-update: every time the app (re)opens, ask the server which version
    // is deployed and compare it to the version baked into THIS bundle. If a newer
    // one exists, reload to pick it up — even when launched from the iPhone home
    // screen, with no need to remove and re-add the shortcut. Never reloads
    // mid-use (only when becoming visible), and at most once per detected version
    // per session, so it can't loop.
    const BUILT_VERSION = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "dev";
    const checkForUpdate = async () => {
      try {
        if (document.visibilityState !== "visible") return;
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const { version } = await res.json();
        if (!version || version === "dev" || version === BUILT_VERSION) return;
        // A newer deployment is live. Guard against reload loops: only attempt
        // once per server version per session.
        if (sessionStorage.getItem("meshi-update-attempt") === version) return;
        sessionStorage.setItem("meshi-update-attempt", version);
        await navigator.serviceWorker?.getRegistration().then((r) => r?.update()).catch(() => {});
        window.location.reload();
      } catch {
        /* offline or transient — ignore, try again next time */
      }
    };
    checkForUpdate();
    const onVisible = () => {
      checkForUpdate();
      // Re-fetch lesson content from the cloud each time the app becomes visible,
      // so edits made in the editor (or on another device) show up on reopen —
      // even when the PWA stays open in the background and React doesn't remount.
      if (document.visibilityState === "visible") loadContent();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      authSub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
