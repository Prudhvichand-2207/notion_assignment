/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  // Optimize bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Vercel handles routing automatically, no need for standalone output
  // Enable static optimization where possible
  swcMinify: true,
}

module.exports = nextConfig

