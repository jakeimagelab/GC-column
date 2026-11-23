import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || (process.env.UI_TEST_MODE === "1" ? ".next-qa" : ".next"),
  reactStrictMode: true,
  devIndicators: false,
  skipTrailingSlashRedirect: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: true },
      { source: "/zh", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
