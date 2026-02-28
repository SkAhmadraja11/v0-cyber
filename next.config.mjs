/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // Apply CORS to all API routes so the Chrome extension can call them
        source: "/api/:path*",
        headers: [
          // Do NOT combine credentials:true with wildcard origin — browsers reject it.
          // Extensions don't send credentials, so wildcard is safe here.
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,PATCH,OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
      {
        // Apply CORS to scanner routes
        source: "/scanner/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
        ],
      },
    ]
  },
}

export default nextConfig
