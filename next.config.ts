import type { NextConfig } from "next";

// 필수 환경변수 검증
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_API_KEY',
  'NEXT_PUBLIC_CDN_URL'
] as const;

// CI is the only build that ships, and the deploy workflow is where these are
// set. A local build is a compile check whose values are never served.
if (process.env.CI) {
  const missing = requiredEnvVars.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

const nextConfig: NextConfig = {
  // Stops next dev writing AGENTS.md and CLAUDE.md into the repo root.
  agentRules: false,
  reactStrictMode: true,
  output: 'export',

  // Disable image optimization (Required for static export)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
