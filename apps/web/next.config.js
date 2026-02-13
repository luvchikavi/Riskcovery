/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@riscovery/ui", "@riscovery/types", "@riscovery/utils"],
  experimental: {
    serverComponentsExternalPackages: ['@napi-rs/canvas', '@prisma/client', 'prisma'],
  },
  images: {
    domains: ["riscovery-documents.s3.amazonaws.com"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
