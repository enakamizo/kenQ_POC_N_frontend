/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    middlewareSourceMaps: true,
  },
}

export default nextConfig;
