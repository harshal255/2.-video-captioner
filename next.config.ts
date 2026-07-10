import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_FIREWORKS_API_KEY: process.env.FIREWORKS_API_KEY || "",
  },
};

export default nextConfig;
