import webpush from "web-push";
import { NextRequest } from "next/server";
import { get } from "@vercel/edge-config";

// GET /api/cron/remind
// Triggered daily at 20:00 Spain time (18:00 UTC summer) by Vercel Cron.
// Reads Sara's push subscription and play status from Edge Config.
// Sends a personalized push notification only if she hasn't played today.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  webpush.setVapidDetails(
    "mailto:meshi-darija@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  try {
    const [subscription, status] = await Promise.all([
      get("push_subscription"),
      get("play_status"),
    ]);

    if (!subscription) {
      return Response.json({ skipped: "No push subscription stored yet" });
    }

    // Check if Sara already played today
    const today = new Date().toLocaleDateString("en-CA");
    const s = status as { playedToday?: boolean; lastPlayedDate?: string; streak?: number } | null;

    if (s?.playedToday && s?.lastPlayedDate === today) {
      return Response.json({ skipped: "Sara ya jugó hoy 🎉" });
    }

    // Build personalized message
    const streak = s?.streak ?? 0;
    const messages = streak > 0
      ? [
          { title: `🔥 ¡Tu racha de ${streak} días en juego!`,     body: "Solo 5 minutos y sigues imparable. Yallah Sara! 🐱" },
          { title: `🐱 Meshi te echa de menos...`,                  body: `¡${streak} días seguidos! No lo rompas esta noche. 💪` },
          { title: `⚡ ${streak} días — ¡no pares ahora!`,          body: "Una lección rápida y Meshi estará muy orgulloso 🇲🇦" },
        ]
      : [
          { title: "🐱 Meshi tiene algo nuevo para ti",              body: "¡Abre la app y aprende Darija hoy! 🇲🇦✨" },
          { title: "📚 Tu lección de Darija te espera",              body: "Meshi está listo. ¡Yallah Sara! 🐱" },
          { title: "🌙 ¿Un poco de Darija antes de dormir?",        body: "Solo 5 minutos. ¡Tú puedes! 🍵🇲🇦" },
        ];

    const msg = messages[Math.floor(Math.random() * messages.length)];

    await webpush.sendNotification(
      subscription as unknown as webpush.PushSubscription,
      JSON.stringify({ ...msg, url: "/" })
    );

    return Response.json({ sent: true, message: msg.title, streak });
  } catch (err) {
    console.error("Cron remind error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
