import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['iyzipay'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Firebase Auth popup'ı (signInWithPopup) COOP strict altında window.close
          // çağrısını yapamaz; same-origin-allow-popups OAuth popup akışını rahatlatır.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ];
  },
};

export default nextConfig;
