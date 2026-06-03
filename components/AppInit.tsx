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
 * - Refills lives based on time elapsed
 * - Registers service worker & re-syncs push subscription
 * - Syncs Sara's play status to server for cron notifications
 */
export function AppInit() {
  const { updateStreakDaily, checkAndRefillLives, setHydrated } = useStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    setHydrated(true);
    updateStreakDaily();
    checkAndRefillLives();

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
    return () => authSub.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
