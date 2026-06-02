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

// POST /api/push/subscribe
// Stores Sara's push subscription in Edge Config so the daily cron can use it.
export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();
    if (!subscription?.endpoint) {
      return Response.json({ error: "Invalid subscription" }, { status: 400 });
    }
    await writeToEdgeConfig([{ key: "push_subscription", value: subscription }]);
    return Response.json({ success: true });
  } catch (err) {
    console.error("subscribe error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
