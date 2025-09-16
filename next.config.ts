import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['source.unsplash.com'],
    unoptimized: true
  },
  experimental: {
    optimizeCss: true
  }
}

export default nextConfig;
