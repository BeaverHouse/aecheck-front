import type { NextConfig } from "next";

// 필수 환경변수 검증
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_API_KEY',
  'NEXT_PUBLIC_CDN_URL'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // GitHub Pages static export 설정
  output: 'export',

  // GitHub Pages 배포시 basePath 설정
  // username.github.io/repo-name 형태면 basePath 필요
  // username.github.io 형태면 basePath 불필요
  basePath: process.env.NODE_ENV === 'production' ? '' : '',

  // Static export에서는 rewrites 사용 불가
  // API 호출은 NEXT_PUBLIC_API_URL로 직접 요청

  // 이미지 최적화 비활성화 (static export 필수)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
