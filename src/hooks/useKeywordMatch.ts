'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useCallback } from 'react';

/**
 * STUB — Algoritma silindi, yeniden yazılacak.
 *
 * Bu hook şu anda hiçbir şey yapmaz. Çağıranlar (present page) derlenebilsin
 * diye imza korundu. Yeni algoritma yazıldığında bu dosya tamamen değişecek.
 */
export function useKeywordMatch(_threshold: number = 0.7) {
  const resetMatch = useCallback(() => {
    /* no-op */
  }, []);

  return { resetMatch };
}
