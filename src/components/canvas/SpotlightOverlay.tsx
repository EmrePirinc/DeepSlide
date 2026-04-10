'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SpotlightOverlayProps {
  /** Birden fazla aday varsa spotlight countdown gösterilir. */
  candidateCount: number;
  /** Countdown bitince çağrılır — en yüksek skorlu adayı seç. */
  onAutoSelect: () => void;
  /** Countdown süresi (ms). WBS: 3 sn. */
  timeoutMs?: number;
  /** Spotlight aktif mi? (candidateCount > 1 olduğunda true). */
  active: boolean;
}

/**
 * SpotlightOverlay
 *
 * Birden fazla keyword eşleşmesi olduğunda ekranda 3 saniyelik
 * bir geri sayım gösterir. Süre dolunca onAutoSelect tetiklenir
 * ve orchestrator en yüksek skorlu görseli odaklar.
 */
export function SpotlightOverlay({
  candidateCount,
  onAutoSelect,
  timeoutMs = 3000,
  active,
}: SpotlightOverlayProps) {
  const [remaining, setRemaining] = useState(timeoutMs);

  useEffect(() => {
    if (!active || candidateCount <= 1) return;

    setRemaining(timeoutMs);
    const step = 100;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= step) {
          clearInterval(interval);
          onAutoSelect();
          return 0;
        }
        return prev - step;
      });
    }, step);

    return () => clearInterval(interval);
  // onAutoSelect intentionally omitted — stable ref expected from caller
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, candidateCount, timeoutMs]);

  const progressPercent = ((timeoutMs - remaining) / timeoutMs) * 100;

  return (
    <AnimatePresence>
      {active && candidateCount > 1 && (
        <motion.div
          key="spotlight-overlay"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
        >
          {/* Badge */}
          <div className="bg-black/80 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full flex items-center gap-2">
            <span className="text-blue-400 font-medium">{candidateCount}</span>
            <span>eşleşme bulundu</span>
            <span className="text-white/50">·</span>
            <span>{Math.ceil(remaining / 1000)}s içinde otomatik seçim</span>
          </div>

          {/* Progress bar */}
          <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-400 rounded-full"
              style={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
