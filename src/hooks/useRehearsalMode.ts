'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useState, useCallback } from 'react';

/**
 * STUB — Algoritma silindi, yeniden yazılacak.
 *
 * RehearsalMode keyword match algoritmasına bağımlıydı. Algoritma yeniden
 * yazılana kadar bu hook boş bir provaroom yönetir; match sonucu sıfır.
 * Çağıran bileşen (RehearsalView) derlenebilsin diye imza korundu.
 */

interface RehearsalWord {
  text: string;
  matched: boolean;
  matchedKeyword?: string;
}

interface RehearsalResult {
  totalWords: number;
  matchedWords: number;
  unmatchedKeywords: string[];
  confidenceScore: number;
}

export function useRehearsalMode(_threshold: number = 0.7) {
  const [isRehearsal, setIsRehearsal] = useState(false);
  const [words] = useState<RehearsalWord[]>([]);
  const [result, setResult] = useState<RehearsalResult | null>(null);

  const startRehearsal = useCallback(() => {
    setIsRehearsal(true);
    setResult(null);
  }, []);

  const stopRehearsal = useCallback(() => {
    setIsRehearsal(false);
    setResult({
      totalWords: 0,
      matchedWords: 0,
      unmatchedKeywords: [],
      confidenceScore: 0,
    });
  }, []);

  return {
    isRehearsal,
    words,
    result,
    startRehearsal,
    stopRehearsal,
  };
}
