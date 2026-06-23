import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Medusa demo images (keep for dev/seed data)
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        // Cloudflare R2 storage (production media)
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        // Cloudflare R2 public domain
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        // Custom R2 public domain
        protocol: "https",
        hostname: "media.biasharahub.co.ke",
      },
    ],
  },
};

export default nextConfig;

