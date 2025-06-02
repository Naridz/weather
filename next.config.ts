import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
   images: {
    domains: ['openweathermap.org'],
  }
};

export default nextConfig;
