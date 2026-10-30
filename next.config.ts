import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `next build` prerenders the page to plain HTML/CSS/JS in ./out.
  output: "export",
};

export default nextConfig;
