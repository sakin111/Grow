import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

    async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:5000/api/v1/:path*",
      },
    ]
  },
};

export default nextConfig;
