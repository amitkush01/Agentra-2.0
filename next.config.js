/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent webpack errors
  webpack: (config, { isServer, dev }) => {
    // Fix for webpack runtime fallback
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Disable filesystem caching in development to avoid chunk corruption
    if (dev) {
      config.cache = false;
    }
    
    return config;
  },
  
  // Experimental features for stability
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  
  // Prevent build errors
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Optimize images
  images: {
    domains: [],
    unoptimized: true,
  },
  
  // Prevent memory issues
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;