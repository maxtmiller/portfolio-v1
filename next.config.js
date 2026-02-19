/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports if needed
  output: 'standalone',
  
  // Add this to help with module resolution
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };
    return config;
  },
}

module.exports = nextConfig