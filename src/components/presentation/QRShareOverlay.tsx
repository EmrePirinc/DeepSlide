// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode } from 'lucide-react';

const KVKK_FLAG_PREFIX = 'deepslide_qr_kvkk_v1_';

interface QRShareOverlayProps {
  url: string;
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function QRShareOverlay({ url, userId, isOpen, onClose }: QRShareOverlayProps) {
  const flagKey = userId ? `${KVKK_FLAG_PREFIX}${userId}` : null;
  const [kvkkAccepted, setKvkkAccepted] = useState(() => {
    if (!flagKey || typeof window === 'undefined') return true;
    return !!localStorage.getItem(flagKey);
  });
  const [renderMs, setRenderMs] = useState<number | null>(null);

  // Auto-close after 10 seconds
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(onClose, 10000);
    return () => clearTimeout(t);
  }, [isOpen, onClose]);

  const handleKvkkAccept = () => {
    if (flagKey) localStorage.setItem(flagKey, '1');
    setKvkkAccepted(true);
  };

  const handleQRRender = () => {
    const end = performance.now();
    setRenderMs(Math.round(end));
    console.debug('[QR] Rendered in', renderMs, 'ms');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative flex flex-col items-center gap-5 p-8 rounded-2xl bg-white"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full p-1.5 hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Kapat"
          >
            <X size={16} />
          </button>

          {!kvkkAccepted ? (
            <div className="flex flex-col items-center gap-4 max-w-xs text-center">
              <QrCode size={32} className="text-gray-400" />
              <div>
                <p className="font-semibold text-gray-800 text-sm mb-1">KVKK Bilgilendirmesi</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Bu QR kodu paylaşım linkinize yönlendirir.
                  <strong> İzleyici IP adresi, cihaz bilgisi veya kişisel verisi toplanmaz.</strong>
                  {' '}DeepSlide KVKK ile tam uyumludur.
                </p>
              </div>
              <button
                onClick={handleKvkkAccept}
                className="bg-gray-900 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Anladım, QR Göster
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <QrCode size={18} className="text-gray-700" />
                <p className="font-semibold text-gray-800 text-sm">Telefona Göster</p>
              </div>

              {/* 380px = approx 10cm on a 96dpi display */}
              <div onLoad={handleQRRender}>
                <QRCodeSVG
                  value={url}
                  size={300}
                  bgColor="#ffffff"
                  fgColor="#111111"
                  level="M"
                />
              </div>

              <p className="text-xs text-gray-400 max-w-[300px] text-center break-all">{url}</p>
              <p className="text-[10px] text-gray-300">10 saniye sonra otomatik kapanır</p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
