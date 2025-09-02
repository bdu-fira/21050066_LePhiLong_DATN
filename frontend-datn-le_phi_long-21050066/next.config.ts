import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Trình duyệt gọi:  /api/<route>  --> Next proxy -->  http://192.168.1.2:3001/<route>
      { source: '/api/:path*', destination: 'http://192.168.1.2:3001/:path*' },
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
};

export default nextConfig;
