import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://10.243.94.64:3000"],
  output: "standalone",
};

export default nextConfig;
