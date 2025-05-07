import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
    {
      source: "/calendar",
      destination: "/calendar/month-view",
      permanent: false,
    },
  ],
};

export default nextConfig;
