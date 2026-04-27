/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

// script-src: Next.js dev server requires 'unsafe-eval' for fast refresh.
// In production the compiled output has no eval(), so we can drop it.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline'";

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "nextjs.org" },
      { protocol: "https", hostname: "unpkg.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline' https://unpkg.com",
              "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://unpkg.com",
              "connect-src 'self' https://api.open-meteo.com https://api.waqi.info",
              "font-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
