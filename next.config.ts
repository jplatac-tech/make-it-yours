import type { NextConfig } from 'next'

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com https://fonts.googleapis.com https://fonts.gstatic.com https://staticimgly.com; worker-src 'self' blob:; font-src 'self' data: https://fonts.gstatic.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  },
]

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [70, 75, 80],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: securityHeaders,
    },
    {
      source: '/catalog/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/mockup/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/gallery/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
  async redirects() {
    return [
      { source: '/products/:slug', destination: '/productos/:slug', permanent: true },
      { source: '/cotizar', destination: '/disenar', permanent: false },
      {
        source: '/cotizar/entrega',
        destination: '/comprar/entrega',
        permanent: false,
      },
    ]
  },
}

let exportedConfig: any = nextConfig

// Enable @next/bundle-analyzer only when ANALYZE=true to avoid requiring the
// package in regular installs. This keeps builds working unless the team runs
// bundle analysis intentionally.
if (process.env.ANALYZE === 'true') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: true,
    })
    exportedConfig = withBundleAnalyzer(nextConfig)
  } catch (err) {
    // bundle analyzer not installed — continue without it
    console.warn('Bundle analyzer not available, skipping')
  }
}

export default exportedConfig as NextConfig
