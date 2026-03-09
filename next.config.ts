import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    workerThreads: true,
    cpus: 4, // use more CPUs for static generation
  },
};

export default nextConfig;