import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  skipTrailingSlashRedirect: true,
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: true },
      { source: "/zh", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
