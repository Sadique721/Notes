import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — no backend required
  // output: "export",  // Enable when deploying to Vercel static

  // Allow MDX
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
    unoptimized: false,
  },
};

export default nextConfig;
