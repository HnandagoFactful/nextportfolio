import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const nextConfig: NextConfig = {
  // Static export for Firebase Hosting — generates the `out/` directory.
  output: 'export',
  // Each page becomes out/en/page/index.html — Firebase cleanUrls handles the rest.
  trailingSlash: true,
  // Image optimization requires a Node.js server — disabled for static export.
  images: { unoptimized: true },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
};

export default withNextIntl(nextConfig);
