import { NextResponse } from "next/server";

// Always run fresh, never cached — this endpoint is how the app detects that a
// newer version has been deployed.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/version
// Returns the commit SHA of the deployment currently serving this request.
// The client compares it to the SHA baked into its own bundle at build time;
// if they differ, a newer deployment exists and the client reloads to get it.
export function GET() {
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    "dev";
  return new NextResponse(JSON.stringify({ version }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
