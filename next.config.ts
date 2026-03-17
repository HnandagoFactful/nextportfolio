import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'canvas.factful.dev' }],
        destination: 'https://factful.dev/en/canvas',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'images.factful.dev' }],
        destination: 'https://factful.dev/en/image-process',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      { source: '/',     destination: '/en/home' },
      { source: '/home', destination: '/en/home' },
      { source: '/en',   destination: '/en/home' },
    ];
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
};

export default withNextIntl(nextConfig);
