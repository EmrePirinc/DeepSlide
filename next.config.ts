import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['iyzipay'],
  async headers() {
    return [
      {
        // Tüm yollar — root dahil. /:path* bazı durumlarda / kökünü kaçırıyor.
        source: '/:path*',
        headers: [
          // Firebase Auth popup (signInWithPopup) COOP strict altında window.closed/close
          // çağrılarını yapamaz; same-origin-allow-popups OAuth popup'larına izin verir.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' },
        ],
      },
      {
        source: '/',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' },
        ],
      },
    ];
  },
};

export default nextConfig;
