/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      'globals.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
};

export default nextConfig;