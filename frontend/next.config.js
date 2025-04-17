/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  webpack: (config) => {
    // Add aliases for ScrollSmoother to use our compatibility layer
    config.resolve.alias = {
      ...config.resolve.alias,
      'gsap/ScrollSmoother': path.resolve(__dirname, 'src/lib/gsap/scrollSmoother.ts'),
      'gsap/dist/ScrollSmoother': path.resolve(__dirname, 'src/lib/gsap/scrollSmoother.ts'),
      'gsap/src/ScrollSmoother': path.resolve(__dirname, 'src/lib/gsap/scrollSmoother.ts'),
      'gsap-trial/ScrollSmoother': path.resolve(__dirname, 'src/lib/gsap/scrollSmoother.ts'),
      'gsap-trial/dist/ScrollSmoother': path.resolve(__dirname, 'src/lib/gsap/scrollSmoother.ts'),
      'gsap-trial/src/ScrollSmoother': path.resolve(__dirname, 'src/lib/gsap/scrollSmoother.ts'),
    };
    return config;
  },
};

module.exports = nextConfig;
