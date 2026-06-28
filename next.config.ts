import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**img.clerk.com",
        port: "",
        search: "",
      },
      { protocol: "https",
        hostname: "**api.dicebear.com",
        port: "",
        search: ""},
    ],
  },
};

export default nextConfig;
