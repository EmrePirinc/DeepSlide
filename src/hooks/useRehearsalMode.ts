'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useState, useCallback, useRef, useEffect } from 'react';
import { useSpeechStore } from '@/stores/speechStore';
import { usePresentationStore } from '@/stores/presentationStore';
import { KeywordMatcher } from '@/lib/speech/keywordMatcher';

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

export function useRehearsalMode(threshold: number = 0.7) {
  const matcherRef = useRef(new KeywordMatcher());
  const [isRehearsal, setIsRehearsal] = useState(false);
  const [words, setWords] = useState<RehearsalWord[]>([]);
  const [result, setResult] = useState<RehearsalResult | null>(null);

  const { currentPresentation } = usePresentationStore();
  const { transcript, interimTranscript } = useSpeechStore();

  // Index oluştur
  useEffect(() => {
    if (currentPresentation?.images) {
      matcherRef.current.buildIndex(currentPresentation.images);
    }
  }, [currentPresentation?.images]);

  // Prova sırasında kelimeleri işle
  useEffect(() => {
    if (!isRehearsal) return;

    const text = transcript || interimTranscript;
    if (!text) return;

    const spoken = text.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);

    const processed: RehearsalWord[] = spoken.map((word) => {
      const matches = matcherRef.current.match([word], threshold);
      if (matches.length > 0) {
        return { text: word, matched: true, matchedKeyword: matches[0].keyword };
      }
      return { text: word, matched: false };
    });

    setWords(processed);
  }, [isRehearsal, transcript, interimTranscript, threshold]);

  const startRehearsal = useCallback(() => {
    setIsRehearsal(true);
    setWords([]);
    setResult(null);
  }, []);

  const stopRehearsal = useCallback(() => {
    setIsRehearsal(false);

    const matched = words.filter((w) => w.matched);

    // Eşleşmeyen keyword'leri bul
    const matchedKeywordSet = new Set(
      matched.map((w) => w.matchedKeyword).filter(Boolean)
    );

    const allKeywords = new Set<string>();
    if (currentPresentation) {
      for (const img of currentPresentation.images) {
        for (const kw of img.keywords) {
          allKeywords.add(kw.text.toLowerCase());
        }
      }
    }

    const unmatchedKeywords = [...allKeywords].filter(
      (kw) => !matchedKeywordSet.has(kw)
    );

    const score =
      words.length > 0
        ? Math.round((matched.length / words.length) * 100)
        : 0;

    setResult({
      totalWords: words.length,
      matchedWords: matched.length,
      unmatchedKeywords: unmatchedKeywords.slice(0, 10),
      confidenceScore: score,
    });
  }, [words, currentPresentation]);

  return {
    isRehearsal,
    words,
    result,
    startRehearsal,
    stopRehearsal,
  };
}
