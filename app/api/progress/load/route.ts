import { NextRequest } from "next/server";
import { get } from "@vercel/edge-config";

// GET /api/progress/load?user=sara
// Reads Sara's cloud progress backup from Edge Config (read-optimized, instant).
export async function GET(req: NextRequest) {
  try {
    const userParam = req.nextUrl.searchParams.get("user") || "sara";
    const key = `progress_${userParam}`.toLowerCase().replace(/[^a-z0-9_]/g, "");
    const snapshot = await get(key);
    return Response.json({ snapshot: snapshot ?? null });
  } catch (err) {
    console.error("progress load error:", err);
    return Response.json({ snapshot: null, error: String(err) }, { status: 200 });
  }
}
