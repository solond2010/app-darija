import { NextRequest } from "next/server";

const EC_ID = "ecfg_msfbkactd7f96cimp0m4x4yg9hty";

async function writeToEdgeConfig(items: { key: string; value: unknown }[]) {
  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${EC_ID}/items?teamId=team_CDUU8DJPje5HMEaX08TCQuhQ`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: items.map((i) => ({ operation: "upsert", key: i.key, value: i.value })),
      }),
    }
  );
  if (!res.ok) throw new Error(await res.text());
}

// POST /api/push/sync
// Called every time the app opens + after every lesson completion.
// Keeps the server up-to-date so the cron sends accurate, personalized notifications.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const status = {
      streak: body.streak ?? 0,
      lastPlayedDate: body.lastPlayedDate ?? null,
      playedToday: body.playedToday ?? false,
      updatedAt: new Date().toISOString(),
    };
    await writeToEdgeConfig([{ key: "play_status", value: status }]);
    return Response.json({ success: true });
  } catch (err) {
    console.error("sync error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
