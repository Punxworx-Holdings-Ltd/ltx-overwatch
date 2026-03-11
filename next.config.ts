import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.mapbox.com" },
      { protocol: "https", hostname: "services.sentinel-hub.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  transpilePackages: [
    "@deck.gl/core",
    "@deck.gl/react",
    "@deck.gl/layers",
    "@deck.gl/geo-layers",
    "@deck.gl/mapbox",
  ],
};

export default nextConfig;
