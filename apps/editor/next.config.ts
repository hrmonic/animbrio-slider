import type { NextConfig } from "next";
import path from "path";

const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: [
    "@animbrio/schema",
    "@animbrio/animation-engine",
    "@animbrio/renderer",
    "@animbrio/editor-core",
    "@animbrio/persistence",
    "@animbrio/interaction-engine",
  ],
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".ts": [".ts", ".tsx"],
      ".tsx": [".tsx"],
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      "@animbrio/schema": path.resolve(__dirname, "../../packages/schema/src"),
      "@animbrio/animation-engine": path.resolve(__dirname, "../../packages/animation-engine/src"),
      "@animbrio/renderer": path.resolve(__dirname, "../../packages/renderer/src"),
      "@animbrio/editor-core": path.resolve(__dirname, "../../packages/editor-core/src"),
      "@animbrio/persistence": path.resolve(__dirname, "../../packages/persistence/src"),
      "@animbrio/interaction-engine": path.resolve(__dirname, "../../packages/interaction-engine/src"),
    };
    return config;
  },
};

export default nextConfig;
