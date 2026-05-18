/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'logos.skyscnr.com' },
      { protocol: 'https', hostname: 'content.airhex.com' },
      { protocol: 'https', hostname: 'www.gstatic.com' },
    ],
  },
};

export default nextConfig;
