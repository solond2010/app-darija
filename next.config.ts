import type { NextConfig } from "next";

// Version baked into the client bundle at build time so the app can detect when a
// newer deployment is live (see components/AppInit.tsx + app/api/version). On
// Vercel this is the git commit SHA; locally it falls back to "dev".
const BUILD_VERSION =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
  "dev";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: BUILD_VERSION,
  },
};

export default nextConfig;
