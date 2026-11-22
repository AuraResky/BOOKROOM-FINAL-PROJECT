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
};

export default nextConfig;