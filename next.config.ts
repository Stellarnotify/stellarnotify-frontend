import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for development-time warnings
  reactStrictMode: true,

  // Produce a self-contained build suitable for Docker / self-hosting
  output: "standalone",

  // Remove the X-Powered-By header for security hygiene
  poweredByHeader: false,

  // Enable gzip compression for standalone server
  compress: true,
};

export default nextConfig;
