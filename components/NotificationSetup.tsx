"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, X, Share, Plus, Smartphone } from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────────────────────

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in window.navigator && (window.navigator as any).standalone) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

const DISMISSED_KEY = "meshi-notif-dismissed";
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

async function subscribeAndSync() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    const key = await urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  }
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  }).catch(() => {});
}

// ── Component ────────────────────────────────────────────────────────────────

export function NotificationSetup() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<"ask" | "ios-install" | "done">("ask");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    // Don't show if already granted/denied or recently dismissed
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSince < 3) return; // Don't re-ask for 3 days
    }
    // Delay 4 seconds so the app loads first
    const t = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setShow(false);
  };

  const handleEnable = async () => {
    // On iOS, must be installed first to receive push
    if (isIOS() && !isInStandaloneMode()) {
      setStep("ios-install");
      return;
    }

    setRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await subscribeAndSync();
        setStep("done");
        setTimeout(() => setShow(false), 2500);
      } else {
        handleDismiss();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="bg-white rounded-3xl shadow-xl border-2 border-brand-beige w-full max-w-sm pointer-events-auto overflow-hidden">
            {/* Close */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {step === "ask" && (
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-coral/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🔔</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base font-title text-brand-dark leading-tight">
                      ¿Activo recordatorios?
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Meshi te avisará si olvidas tu lección diaria 🐱
                    </p>
                  </div>
                </div>
                <div className="bg-brand-cream rounded-2xl p-3 mb-4 space-y-1.5">
                  {[
                    { emoji: "🔥", text: "Alerta de racha en peligro" },
                    { emoji: "⏰", text: "Recordatorio a las 20:00 si no has jugado" },
                    { emoji: "🎉", text: "Celebración de logros desbloqueados" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <span>{item.emoji}</span>
                      <span className="font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 py-2.5 rounded-2xl border-2 border-brand-beige text-slate-500 text-xs font-bold font-title"
                  >
                    Ahora no
                  </button>
                  <button
                    onClick={handleEnable}
                    disabled={requesting}
                    className="flex-1 py-2.5 rounded-2xl btn-3d-primary text-xs font-title flex items-center justify-center gap-1.5"
                  >
                    {requesting ? (
                      <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        ¡Activar!
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === "ios-install" && (
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base font-title text-brand-dark leading-tight">
                      Instala Meshi en tu iPhone
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      iOS necesita que la app esté instalada para recibir notificaciones
                    </p>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  {[
                    {
                      icon: <Share className="w-4 h-4 text-blue-500" />,
                      bg: "bg-blue-50",
                      step: "1",
                      text: <span>Toca el botón <strong>Compartir</strong> <span className="inline-block bg-blue-100 px-1 rounded">⬆️</span> en Safari</span>,
                    },
                    {
                      icon: <Plus className="w-4 h-4 text-emerald-500" />,
                      bg: "bg-emerald-50",
                      step: "2",
                      text: <span>Selecciona <strong>&ldquo;Añadir a pantalla de inicio&rdquo;</strong></span>,
                    },
                    {
                      icon: <Bell className="w-4 h-4 text-brand-coral" />,
                      bg: "bg-brand-pink/20",
                      step: "3",
                      text: <span>Abre Meshi desde el icono y activa las notificaciones 🐱</span>,
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`${item.bg} w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 pt-1 text-xs text-slate-600 leading-relaxed">
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleDismiss}
                  className="w-full py-3 rounded-2xl btn-3d-primary text-xs font-title"
                >
                  ¡Entendido! Voy a instalarlo 🐱
                </button>
              </div>
            )}

            {step === "done" && (
              <div className="p-5 flex flex-col items-center text-center gap-2">
                <span className="text-4xl">🎉</span>
                <h3 className="font-bold text-base font-title text-brand-dark">
                  ¡Notificaciones activadas!
                </h3>
                <p className="text-xs text-slate-400">
                  Meshi te avisará si olvidas practicar hoy. ¡Yallah! 🐱🔥
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
