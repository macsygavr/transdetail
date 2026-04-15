import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: resolve("../"),
    resolveAlias: {
      "@tanstack/react-query": "./node_modules/@tanstack/react-query",
    },
  },
  transpilePackages: ["@cms/sdk"],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination:
            "https://transdetail-stage.intranet.banana.djerboa.dev/api/:path*",
        },
        {
          source: "/media/:path*",
          destination:
            "https://transdetail-stage.intranet.banana.djerboa.dev/media/:path*",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
