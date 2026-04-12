'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useRef, useEffect, useCallback } from 'react';
import { useSpeechStore } from '@/stores/speechStore';
import { usePresentationStore } from '@/stores/presentationStore';
import { KeywordMatcher } from '@/lib/speech/keywordMatcher';
import { AnimationOrchestrator } from '@/lib/animation/orchestrator';

/**
 * Ses transkriptini keyword'lerle eşleştirir.
 *
 * Prezi modu: en yüksek skora sahip tek görsel `focusImage()` ile seçilir.
 * Çok kelimeli keyword desteği: N-gram (1-3 kelime) ile eşleştirir.
 * Çoklu eşleşmede en iyi skor kazanır — diğerleri decay'e devam eder.
 */
export function useKeywordMatch(threshold: number = 0.7) {
  const matcherRef = useRef(new KeywordMatcher());
  const orchestratorRef = useRef(new AnimationOrchestrator());

  const { interimTranscript, transcript } = useSpeechStore();
  const { currentPresentation, setActiveImages, setFocusedImage, setViewMode } = usePresentationStore();

  // Keyword index'i oluştur (presentation değiştiğinde)
  useEffect(() => {
    if (currentPresentation?.images) {
      matcherRef.current.buildIndex(currentPresentation.images);
    }
  }, [currentPresentation?.images]);

  // Orchestrator onChange callback — hem activeIds hem focusedId işle
  useEffect(() => {
    const orchestrator = orchestratorRef.current;
    orchestrator.setOnChange((activeIds, focusedId) => {
      setActiveImages(activeIds);
      // KRİTİK: focusedId varsa slaytı odakla + focused moduna geç (Prezi zoom)
      if (focusedId) {
        setFocusedImage(focusedId);
        setViewMode('focused');
      } else {
        setFocusedImage(null);
      }
    });

    return () => {
      orchestrator.destroy();
    };
  }, [setActiveImages, setFocusedImage, setViewMode]);

  // Transkript değiştiğinde eşleştir
  useEffect(() => {
    const text = interimTranscript || transcript;
    if (!text) return;

    const words = text.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);
    // Son 5 kelimeyi al — çok kelimeli keyword'ler için (3-gram + buffer)
    const recentWords = words.slice(-5);
    if (recentWords.length === 0) return;

    const matches = matcherRef.current.match(recentWords, threshold);
    if (matches.length === 0) return;

    // En yüksek skoru olan eşleşmeyi bul (zaten sıralı geldi)
    const topMatch = matches[0];

    // Prezi modu: en iyi görsel tek odaklanma hedefi
    if (topMatch.imageIds.length > 0) {
      orchestratorRef.current.focusImage(topMatch.imageIds[0], topMatch.score);
    } else {
      // Fallback: tüm eşleşen görselleri aktive et
      const allImageIds = matches.flatMap((m) => m.imageIds);
      orchestratorRef.current.activateImages([...new Set(allImageIds)]);
    }

    useSpeechStore.getState().setMatches(matches);
  }, [interimTranscript, transcript, threshold]);

  const resetMatch = useCallback(() => {
    orchestratorRef.current.reset();
    useSpeechStore.getState().setMatches([]);
  }, []);

  return { resetMatch };
}
