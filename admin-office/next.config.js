const nextConfig = {
  basePath: '',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'paxintrade.com',
      },
    ],
  },
  i18n: {
    locales: ['en', 'ru', 'ka', 'es'], // replace with your locales
    defaultLocale: 'en',
  },
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://go.paxintrade.com/api/:path*', // Proxy to Backend
      },
    ];
  },
};

module.exports = nextConfig;
