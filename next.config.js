/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Let Next resize and cache menu images instead of downloading full-size
    // Unsplash assets directly in the browser.
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig;
