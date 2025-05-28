import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
    {
      source: "/calendar",
      destination: "/calendar/month-view",
      permanent: false,
    },
    {
      source: "/",
      destination: "/home",
      permanent: false,
    },
  ],
};

export default nextConfig;
