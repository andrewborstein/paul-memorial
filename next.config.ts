/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep if you use Server Actions (unrelated to images)
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },

  images: {
    // Allow any non-Cloudinary images you use (e.g., YouTube thumbs)
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],

    // Useful for the built-in optimizer (Cloudinary already negotiates via f_auto)
    formats: ['image/avif', 'image/webp'],

    // Good global defaults if you ever use the default optimizer for non-CLD images
    deviceSizes: [360, 640, 828, 1024, 1280, 1600, 1920],
    imageSizes: [96, 144, 256, 400, 512, 800],

    // Applies only to images processed by Next’s optimizer (ignored by custom loader)
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
};

export default nextConfig;
