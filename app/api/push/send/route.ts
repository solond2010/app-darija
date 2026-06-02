import webpush from "web-push";
import { NextRequest } from "next/server";
import { get } from "@vercel/edge-config";

// POST /api/push/send — manual test: sends a push to Sara's stored subscription
// Header: x-admin-secret: <CRON_SECRET>
export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-secret") !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  webpush.setVapidDetails(
    "mailto:meshi-darija@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  try {
    const body = await req.json().catch(() => ({}));
    const subscription = body.subscription ?? await get("push_subscription");

    if (!subscription) {
      return Response.json({ error: "No subscription found" }, { status: 404 });
    }

    const title = body.title ?? "🐱 Meshi — prueba de notificación";
    const bodyText = body.body ?? "¡Las notificaciones funcionan! 🎉🇲🇦";

    await webpush.sendNotification(
      subscription as unknown as webpush.PushSubscription,
      JSON.stringify({ title, body: bodyText, url: "/" })
    );
    return Response.json({ sent: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
