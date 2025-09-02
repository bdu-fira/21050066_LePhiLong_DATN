import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/backend/:path*', destination: 'http://192.168.1.2:3001/:path*' },
    ];
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Permissions-Policy', value: "camera=(self)" },
      ],
    }];
  },
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', "*.ngrok-free.app"],
};

export default nextConfig;
