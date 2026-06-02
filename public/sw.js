// Meshi Service Worker — Push Notifications

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));

// ── Push received ──────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch { data = { title: "Meshi", body: event.data.text() }; }

  const options = {
    body: data.body || "¡No olvides tu lección de Darija hoy! 🐱",
    icon: "/icon.png",
    badge: "/icon.png",
    tag: "meshi-reminder",
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" },
    actions: [
      { action: "open",    title: "🐱 Abrir Meshi" },
      { action: "dismiss", title: "Luego"           },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "🔥 Meshi te llama", options)
  );
});

// ── Notification click ─────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((wins) => {
        for (const w of wins) {
          if ("focus" in w) return w.focus();
        }
        return clients.openWindow(event.notification.data?.url || "/");
      })
  );
});
