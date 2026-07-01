/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Build the workspace api-client from source.
  transpilePackages: ['@scrai/api-client'],
  // Standalone output keeps the Docker runtime image small.
  output: 'standalone',
  experimental: {
    // Allow importing files from the monorepo root (workspace packages).
    externalDir: true,
  },
};

export default nextConfig;
