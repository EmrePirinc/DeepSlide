'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useSpeechStore } from '@/stores/speechStore';
import { usePresentationStore } from '@/stores/presentationStore';
import { KeywordMatcher } from '@/lib/speech/keywordMatcher';
import { AnimationOrchestrator } from '@/lib/animation/orchestrator';

/**
 * Ses transkriptini keyword'lerle eşleştirir ve aktif görselleri yönetir.
 */
export function useKeywordMatch(threshold: number = 0.7) {
  const matcherRef = useRef(new KeywordMatcher());
  const orchestratorRef = useRef(new AnimationOrchestrator());

  const { interimTranscript, transcript } = useSpeechStore();
  const { currentPresentation, setActiveImages } = usePresentationStore();

  // Index'i oluştur (presentation değiştiğinde)
  useEffect(() => {
    if (currentPresentation?.images) {
      matcherRef.current.buildIndex(currentPresentation.images);
    }
  }, [currentPresentation?.images]);

  // Orchestrator onChange callback
  useEffect(() => {
    const orchestrator = orchestratorRef.current;
    orchestrator.setOnChange((activeIds) => {
      setActiveImages(activeIds);
    });

    return () => {
      orchestrator.destroy();
    };
  }, [setActiveImages]);

  // Transkript değiştiğinde eşleştir (debounce ile)
  useEffect(() => {
    const text = interimTranscript || transcript;
    if (!text) return;

    const words = text.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);
    // Son 3 kelimeyi al — daha hızlı eşleşme, daha az false positive
    const recentWords = words.slice(-3);

    if (recentWords.length === 0) return;

    const matches = matcherRef.current.match(recentWords, threshold);

    if (matches.length > 0) {
      const allImageIds = matches.flatMap((m) => m.imageIds);
      const unique = [...new Set(allImageIds)];
      orchestratorRef.current.activateImages(unique);

      useSpeechStore.getState().setMatches(matches);
    }
  }, [interimTranscript, transcript, threshold]);

  const resetMatch = useCallback(() => {
    orchestratorRef.current.reset();
    useSpeechStore.getState().setMatches([]);
  }, []);

  return { resetMatch };
}
