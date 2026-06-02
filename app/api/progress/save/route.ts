import { NextRequest } from "next/server";

const EC_ID = "ecfg_msfbkactd7f96cimp0m4x4yg9hty";
const TEAM_ID = "team_CDUU8DJPje5HMEaX08TCQuhQ";

async function writeToEdgeConfig(items: { key: string; value: unknown }[]) {
  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${EC_ID}/items?teamId=${TEAM_ID}`,
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

// POST /api/progress/save
// Stores Sara's full progress snapshot in Edge Config as an automatic cloud backup.
// Guards against accidentally saving an "empty" snapshot that could overwrite good data.
export async function POST(req: NextRequest) {
  try {
    const snapshot = await req.json();
    if (!snapshot || typeof snapshot !== "object") {
      return Response.json({ error: "Invalid snapshot" }, { status: 400 });
    }
    // Don't persist a brand-new empty profile over an existing backup.
    const hasProgress =
      (snapshot.xp ?? 0) > 0 ||
      (Array.isArray(snapshot.completedLessons) && snapshot.completedLessons.length > 0);
    if (!hasProgress) {
      return Response.json({ skipped: true, reason: "empty snapshot" });
    }

    const key = `progress_${snapshot.userName || "sara"}`.toLowerCase().replace(/[^a-z0-9_]/g, "");
    await writeToEdgeConfig([{ key, value: { ...snapshot, savedAt: new Date().toISOString() } }]);
    return Response.json({ success: true });
  } catch (err) {
    console.error("progress save error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
