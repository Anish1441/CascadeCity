/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "nextjs.org" },
      { protocol: "https", hostname: "unpkg.com" },
    ],
  },
};

export default nextConfig;
