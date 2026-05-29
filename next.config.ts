import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Proxy /api/ingest-gate/* and /api/query-service/* to EC2 server-side.
  // This avoids browser mixed-content blocking (HTTPS Vercel → HTTP EC2).
  async rewrites() {
    return [
      {
        source: '/api/ingest-gate/:path*',
        destination: `${process.env.INGEST_GATE_URL}/:path*`,
      },
      {
        source: '/api/query-service/:path*',
        destination: `${process.env.QUERY_SERVICE_URL}/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://avatars.githubusercontent.com",
              // Browser only ever calls 'self' (Vercel) — rewrites handle EC2 server-side
              "connect-src 'self'",
              "font-src 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
