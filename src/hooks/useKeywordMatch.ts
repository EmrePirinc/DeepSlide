'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useRef, useEffect, useCallback } from 'react';
import { useSpeechStore } from '@/stores/speechStore';
import { usePresentationStore } from '@/stores/presentationStore';
import { KeywordMatcher } from '@/lib/speech/keywordMatcher';
import { AnimationOrchestrator } from '@/lib/animation/orchestrator';
import { prefetchEmbedder } from '@/lib/speech/embedder';
import type { MatchResult } from '@/lib/speech/types';

const IS_DEV =
  typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

function matchDebug(reason: string, payload: Record<string, unknown>): void {
  if (!IS_DEV) return;
  // eslint-disable-next-line no-console
  console.debug('[match]', reason, payload);
}

/**
 * Ses transkriptini keyword'lerle eşleştirir.
 *
 * Pipeline:
 *   1. Streaming prefix early-commit (interim'in son token'ı yeterli prefix olursa)
 *   2. Full match: N-gram + ensemble + partial trigger + fuzzy fallback
 *   3. Cooldown boost — son 3 sn içinde tetiklenen imageId'ye +0.05 (flicker bastırma)
 *   4. Slide locality prior — mevcut slayt ±1 komşularına +0.03 (tie-break)
 *   5. Confidence fusion — düşük ASR confidence → threshold +0.08
 *   6. Orchestrator focusImage (hysteresis orchestrator'da)
 */
export function useKeywordMatch(threshold: number = 0.7) {
  const matcherRef = useRef(new KeywordMatcher());
  const orchestratorRef = useRef(new AnimationOrchestrator());
  const lastPhraseRef = useRef<string>('');
  const lastPrefixRef = useRef<string>('');

  /**
   * recentFocusRef — son N saniye içinde tetiklenen imageId → timestamp.
   * Cooldown boost hesabında kullanılır. 5 sn üstü entry'ler GC edilir.
   */
  const recentFocusRef = useRef<Map<string, number>>(new Map());

  /**
   * matchSeqRef — her match çağrısı için monotonik ID.
   * Async rerank tamamlandığında eğer seq güncellemişse stale sonuç iptal.
   * Bu, geç çözülen rerank promise'ının eski bir keyword'ü zoom'lamasını önler
   * (kullanıcı sessizken "kendiliğinden zoom" flicker'ının gerçek kök nedeni).
   */
  const matchSeqRef = useRef<number>(0);

  const { interimTranscript, transcript, interimConfidence } = useSpeechStore();
  const { currentPresentation, setActiveImages, setFocusedImage, setViewMode } = usePresentationStore();

  // Keyword index'i oluştur (presentation değiştiğinde) + embedding prefetch
  useEffect(() => {
    if (!currentPresentation?.images) return;
    matcherRef.current.buildIndex(currentPresentation.images);
    matchDebug('buildIndex', {
      imageCount: currentPresentation.images.length,
      keywordCount: currentPresentation.images.reduce((a, i) => a + i.keywords.length, 0),
    });

    // Background: mE5 modelini prefetch et + embedding cache'i doldur.
    // Non-blocking — eğer model yüklenmezse match normal çalışır (graceful).
    prefetchEmbedder();
    const matcher = matcherRef.current;
    let cancelled = false;
    (async () => {
      try {
        await matcher.prefetchEmbeddings();
        if (!cancelled) matchDebug('embeddingsPrefetched', {});
      } catch {
        // Silent fail — rerank sırasında ensemble'a düşer
      }
    })();

    return () => {
      cancelled = true;
    };
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

  // Streaming prefix early-commit — interim'in son token'ı
  useEffect(() => {
    if (!interimTranscript) return;
    const tail = interimTranscript.trim().split(/\s+/).pop() ?? '';
    if (tail.length < 3) return;

    // Dedup — aynı prefix'i tekrar tetikleme
    if (tail === lastPrefixRef.current) return;
    lastPrefixRef.current = tail;

    const prefixMatch = matcherRef.current.matchStreamingPrefix(tail, threshold);
    if (!prefixMatch) return;

    matchDebug('streamingPrefix', { tail, imageId: prefixMatch.imageIds[0], score: prefixMatch.score });
    orchestratorRef.current.focusImage(prefixMatch.imageIds[0], prefixMatch.score);
    recentFocusRef.current.set(prefixMatch.imageIds[0], Date.now());
  }, [interimTranscript, threshold]);

  // FINAL transcript → full match (N-gram + fuzzy + locality + cooldown)
  //
  // KRİTİK: Bu effect SADECE final transcript üzerinde çalışır. Interim üzerinde
  // çalışmaz çünkü WebSpeech interim'i çok gürültülü — nefes, çevre sesi, mic
  // noise sürekli yanlış kelime tahminleri üretir ve bunlar ghost zoom
  // (sahte focus override) yaratır. Hızlı tepki için streaming prefix effect'i
  // (yukarıda) interim'in son token'ını dinliyor zaten.
  useEffect(() => {
    if (!transcript) return;

    const words = transcript.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);
    const recentWords = words.slice(-5);
    if (recentWords.length === 0) return;

    // Aynı 5-kelime penceresi → atla
    const phrase = recentWords.join(' ');
    if (phrase === lastPhraseRef.current) return;
    lastPhraseRef.current = phrase;

    // Confidence fusion: ASR belirsizse threshold'u dinamik yükselt
    const effectiveThreshold =
      interimConfidence < 0.5 ? threshold + 0.08 : threshold;

    const matches = matcherRef.current.match(recentWords, effectiveThreshold);
    if (matches.length === 0) {
      matchDebug('noMatch', { phrase, effectiveThreshold });
      return;
    }

    // ----- COOLDOWN BOOST -----
    // Son 3 sn içinde zaten tetiklenen imageId'ye +0.05 → flicker bastırma
    const now = Date.now();
    const COOLDOWN_MS = 3000;
    const COOLDOWN_BOOST = 0.05;

    // ----- SLIDE LOCALITY -----
    // Mevcut slayt ±1 komşularına +0.03 → tie-break
    const activeSlideIds = new Set(
      usePresentationStore.getState().getActiveSlideImageIds(),
    );
    const LOCALITY_BOOST = 0.03;

    const boosted: MatchResult[] = matches.map((m) => {
      const firstId = m.imageIds[0];
      let boost = 0;
      const lastAt = recentFocusRef.current.get(firstId);
      if (lastAt !== undefined && now - lastAt < COOLDOWN_MS) {
        boost += COOLDOWN_BOOST;
      }
      if (activeSlideIds.has(firstId)) {
        boost += LOCALITY_BOOST;
      }
      return boost > 0 ? { ...m, score: Math.min(1, m.score + boost) } : m;
    });
    boosted.sort((a, b) => b.score - a.score);

    // Cooldown GC — 5 sn üstü entry'leri temizle
    for (const [id, at] of recentFocusRef.current) {
      if (now - at > 5000) recentFocusRef.current.delete(id);
    }

    // ----- IMMEDIATE FOCUS (ensemble-only, sync) -----
    // Önce ensemble sonucuyla hemen focus et. Bu sayede kullanıcı konuştuğu
    // anda görsel tepki verir — embedding download / rerank beklemeden.
    const ensembleTop = boosted[0];
    if (ensembleTop && ensembleTop.imageIds.length > 0) {
      orchestratorRef.current.focusImage(
        ensembleTop.imageIds[0],
        ensembleTop.score,
      );
      recentFocusRef.current.set(ensembleTop.imageIds[0], Date.now());
    }
    useSpeechStore.getState().setMatches(boosted);

    matchDebug('fullMatch', {
      phrase,
      topKeyword: ensembleTop?.keyword,
      topScore: ensembleTop?.score,
      effectiveThreshold,
    });

    // ----- CASCADED EMBEDDING RERANK (async, stale-safe) -----
    // Sadece belirsizlik band'ında (0.55-0.80) çalışır VE embedder hazırsa.
    // Model yüklü değilse rerankWithEmbedding anında döner.
    // Stale rerank koruması: her match için sequence number al, async dönüşte
    // aynı seq hâlâ aktif mi kontrol et. Kullanıcı başka şey söylediyse atla.
    if (!ensembleTop) return;
    const mySeq = ++matchSeqRef.current;
    const matcher = matcherRef.current;

    void (async () => {
      let reranked = boosted;
      try {
        reranked = await matcher.rerankWithEmbedding(transcript, boosted);
      } catch {
        return;
      }

      // STALE GUARD: bu rerank başlatıldıktan sonra başka match geldiyse,
      // (kullanıcı yeni cümle söylediyse veya sessizleştiyse), bu sonucu at.
      if (matchSeqRef.current !== mySeq) return;

      // Eğer rerank sıralamayı değiştirmediyse yeni focus'a gerek yok
      const rerankedTop = reranked[0];
      if (!rerankedTop || rerankedTop.imageIds[0] === ensembleTop.imageIds[0]) {
        return;
      }

      // Rerank yeni bir image seçtiyse focus et (embedding semantic override)
      matchDebug('rerankOverride', {
        from: ensembleTop.imageIds[0],
        to: rerankedTop.imageIds[0],
        ensembleScore: ensembleTop.score,
        rerankScore: rerankedTop.score,
      });
      orchestratorRef.current.focusImage(
        rerankedTop.imageIds[0],
        rerankedTop.score,
      );
      recentFocusRef.current.set(rerankedTop.imageIds[0], Date.now());
      useSpeechStore.getState().setMatches(reranked);
    })();
  }, [transcript, threshold, interimConfidence]);

  // Final transcript geldiğinde history reset
  useEffect(() => {
    if (!transcript) return;
    lastPrefixRef.current = '';
  }, [transcript]);

  const resetMatch = useCallback(() => {
    orchestratorRef.current.reset();
    recentFocusRef.current.clear();
    lastPhraseRef.current = '';
    lastPrefixRef.current = '';
    useSpeechStore.getState().setMatches([]);
  }, []);

  return { resetMatch };
}
