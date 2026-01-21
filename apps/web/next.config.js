/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@riscovery/ui", "@riscovery/types", "@riscovery/utils"],
  experimental: {
    // typedRoutes disabled due to dynamic route parameters
  },
  images: {
    domains: ["riscovery-documents.s3.amazonaws.com"],
  },
};

module.exports = nextConfig;
