'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useCallback, useEffect, useRef } from 'react';
import { useSpeechStore } from '@/stores/speechStore';
import { usePresentationStore } from '@/stores/presentationStore';
import { normalizeAndAsciify, fastTurkishStemmer } from '@/lib/speech/turkishNLP';
import { AhoCorasickAutomaton } from '@/lib/speech/ahoCorasick';

/**
 * Ses → görsel eşleştirme motoru + Voice Semantic Jump.
 *
 * Tasarım kararları:
 *   1. FINAL transcript + INTERIM DEBOUNCE — final gelirse anında, interim
 *      400ms durursa (kullanıcı bir kelime bitirdi kabul) kendiliğinden tetik
 *   2. Aho-Corasick O(n) multi-pattern match — yüzlerce keyword'ü tek tarama
 *   3. Light Turkish suffix stripping — yolu/yolunda/yolları → yol
 *   4. Asciify diacritic — yürüyüş ↔ yuruyus her iki yönde
 *   5. Negatives O(1) HashSet — sis/siz homofon koruması
 *   6. Longest match wins — multi-word keyword'lerde en spesifik kazanır (FR-004)
 *   7. Match miss → eski focus KORUNUR (overview'e düşmez)
 *   8. Same-image 500ms debounce — WebSpeech restart repetition koruması
 *   9. RECENCY PRIOR — Son 60sn gösterilmiş slayt deprioritize (FR-005)
 *  10. ARIA LIVE REGION — Ekran okuyucu için slayt değişim duyurusu (FR-006)
 *
 * WebSpeech davranışı: kullanıcı durmadıkça `isFinal=true` gelmez. Bu yüzden
 * interim'i de dinliyoruz. Gürültü koruması: 400ms idle süresi + same-image
 * debounce. Yani "sahte interim" değişiklikleri 400ms içinde tetik atamaz.
 *
 * Sıfır harici NPM bağımlılığı.
 */

const SAME_IMAGE_DEBOUNCE_MS = 500;
const INTERIM_IDLE_MS = 400;

/** FR-005: Recency window — son N ms içinde gösterilmiş slayt -2 puan penalty alır. */
const RECENCY_WINDOW_MS = 60_000;
/** FR-005: Penalty patternLength'ten çıkarılan değer. */
const RECENCY_PENALTY = 2;

/** FR-006: ARIA live region DOM id */
const ARIA_ANNOUNCER_ID = 'voice-jump-announcer';

export function useKeywordMatch(_threshold: number = 0.7) {
  // threshold MVP'de kullanılmıyor — Aho-Corasick exact string match, skor yok.
  // İmza korundu çünkü çağıran (present page) matchThreshold geçiriyor.
  // Gelecek versiyon (fuzzy/semantic rerank) için rezerv.
  void _threshold;

  // Store subscription — selective, gereksiz re-render yok
  const transcript = useSpeechStore((s) => s.transcript);
  const interimTranscript = useSpeechStore((s) => s.interimTranscript);
  const currentPresentation = usePresentationStore((s) => s.currentPresentation);
  const setFocusedImage = usePresentationStore((s) => s.setFocusedImage);

  // Mutable refs — re-render tetiklemesin
  const automatonRef = useRef<AhoCorasickAutomaton | null>(null);
  const negativesRef = useRef<Set<string>>(new Set());
  const lastFocusRef = useRef<{ imageId: string; at: number } | null>(null);
  const lastInputRef = useRef<string>('');
  const interimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** FR-005: imageId → lastShownAt (ms epoch) — recency prior hesabı için. */
  const recentShownRef = useRef<Map<string, number>>(new Map());

  // ==========================================================================
  // 1. buildIndex — sunum yüklenince Aho-Corasick otomatını kur
  // ==========================================================================
  useEffect(() => {
    if (!currentPresentation?.images) return;

    const automaton = new AhoCorasickAutomaton();
    const negatives = new Set<string>();

    for (const img of currentPresentation.images) {
      if (img.analysisStatus !== 'completed') continue;
      if (!img.keywords?.length) continue;

      for (const kw of img.keywords) {
        // Her varyasyon = ana metin + synonyms + forms
        const variations = [
          kw.text,
          ...(kw.synonyms ?? []),
          ...(kw.forms ?? []),
        ].filter((v) => v && v.trim().length > 0);

        for (const variation of variations) {
          // Asciified orijinal form
          const asciified = normalizeAndAsciify(variation);
          if (!asciified) continue;
          automaton.addPattern(kw.id, img.id, asciified);

          // Stem formu (kelime kelime stem + join)
          const words = asciified.split(' ');
          const stemmed = words.map(fastTurkishStemmer).join(' ');
          if (stemmed && stemmed !== asciified) {
            automaton.addPattern(kw.id, img.id, stemmed);
          }

          // Single-word ise hem stemmed hem orijinal zaten yukarıda eklendi.
          // Multi-word için ek olarak her constituent word'ü partial match
          // olarak eklemek istiyorsak (örn. "yürüyüş yolu" için "yürüyüş"
          // tek başına) — ama bu false-positive riski yaratır. Aho-Corasick
          // zaten yapısı gereği tüm substring'leri bulur, partial istemezsek
          // sadece full pattern'ı arıyoruz. Şimdilik partial eklemiyoruz.
        }

        // Negatives — cümlede geçerse match iptal
        for (const neg of kw.negatives ?? []) {
          const normalizedNeg = normalizeAndAsciify(neg);
          if (normalizedNeg) negatives.add(normalizedNeg);
        }
      }
    }

    automaton.buildAutomaton();
    automatonRef.current = automaton;
    negativesRef.current = negatives;
  }, [currentPresentation?.images]);

  // ==========================================================================
  // 2. Core match runner — paylaşılan (final + interim-debounce)
  // ==========================================================================
  const runMatch = useCallback((input: string) => {
    if (!input || !automatonRef.current) return;

    // Aynı input tekrar gelmişse atla (WebSpeech repetition koruması)
    if (input === lastInputRef.current) return;
    lastInputRef.current = input;

    // Normalize + tokenize
    const normalized = normalizeAndAsciify(input);
    if (!normalized) return;

    const tokens = normalized.split(' ').filter(Boolean);
    if (tokens.length === 0) return;

    // Negative check — cümlede herhangi bir negative token varsa match iptal
    for (const token of tokens) {
      if (negativesRef.current.has(token)) return;
    }

    // Stem her tokeni, boşlukla birleştir → Aho-Corasick üzerinde tara
    const stemmedText = tokens.map(fastTurkishStemmer).join(' ');

    const matches = automatonRef.current.search(stemmedText);
    if (matches.length === 0) {
      // Miss → eski focus KORUNUR
      return;
    }

    // FR-004 + FR-005: Longest pattern + recency prior ile scoring.
    //
    // effectivePriority = patternLength - (recency penalty if shown recently)
    // Son 60sn içinde gösterilmiş bir slayt -2 puan alır → aynı keyword'ü içeren
    // farklı slayt varsa o kazanır. Aynı keyword sadece bir slayta aitse
    // yine kazanır (penalty düşse bile pozitif kalır).
    const now = Date.now();
    const scored = matches.map((m) => {
      const lastShown = recentShownRef.current.get(m.imageId) ?? 0;
      const elapsed = now - lastShown;
      const penalty = elapsed < RECENCY_WINDOW_MS ? RECENCY_PENALTY : 0;
      const effectivePriority = m.patternLength - penalty;
      return { match: m, effectivePriority };
    });

    // Longest effective priority + en geç endIndex kazanır (tie-break).
    scored.sort((a, b) => {
      if (b.effectivePriority !== a.effectivePriority) {
        return b.effectivePriority - a.effectivePriority;
      }
      return b.match.endIndex - a.match.endIndex;
    });

    const best = scored[0].match;
    if (scored[0].effectivePriority <= 0) {
      // Penalty bile çıkarıldığında 0'ın altına düşerse tetikleme yok
      // (çok tekrarlı kısa match senaryosu).
      return;
    }

    // Same-image debounce
    const last = lastFocusRef.current;
    if (last && last.imageId === best.imageId && now - last.at < SAME_IMAGE_DEBOUNCE_MS) {
      return;
    }

    // FR-003: Focused image değiştir.
    setFocusedImage(best.imageId);
    lastFocusRef.current = { imageId: best.imageId, at: now };
    recentShownRef.current.set(best.imageId, now);

    // Recency map GC — 120sn üstü entry temizle (memory leak önleme).
    for (const [id, ts] of recentShownRef.current) {
      if (now - ts > RECENCY_WINDOW_MS * 2) {
        recentShownRef.current.delete(id);
      }
    }

    // FR-006: ARIA live region duyurusu — ekran okuyucular için.
    if (typeof document !== 'undefined') {
      const announcer = document.getElementById(ARIA_ANNOUNCER_ID);
      if (announcer) {
        const images = currentPresentation?.images ?? [];
        const idx = images.findIndex((i) => i.id === best.imageId);
        const slideLabel = idx >= 0 ? (images[idx]?.fileName ?? `Slayt ${idx + 1}`) : '';
        announcer.textContent = idx >= 0
          ? `Slayt ${idx + 1}'e geçildi — ${slideLabel}`
          : '';
      }
    }
  }, [setFocusedImage, currentPresentation]);

  // ==========================================================================
  // 3. FINAL transcript — WebSpeech silence'da commit edince (authoritative)
  // ==========================================================================
  useEffect(() => {
    if (!transcript) return;

    // Final geldi → bekleyen interim timer'ı iptal et
    if (interimTimerRef.current) {
      clearTimeout(interimTimerRef.current);
      interimTimerRef.current = null;
    }
    runMatch(transcript);
  }, [transcript, runMatch]);

  // ==========================================================================
  // 4. INTERIM debounce — 400ms değişmezse "kullanıcı kelime bitirdi" kabul
  // ==========================================================================
  useEffect(() => {
    if (!interimTranscript) return;

    // Önceki timer'ı iptal — interim değişiyor, idle değil
    if (interimTimerRef.current) {
      clearTimeout(interimTimerRef.current);
    }

    // Yeni timer: 400ms boyunca interim değişmezse match çalıştır
    interimTimerRef.current = setTimeout(() => {
      runMatch(interimTranscript);
      interimTimerRef.current = null;
    }, INTERIM_IDLE_MS);

    return () => {
      if (interimTimerRef.current) {
        clearTimeout(interimTimerRef.current);
        interimTimerRef.current = null;
      }
    };
  }, [interimTranscript, runMatch]);

  // ==========================================================================
  // 5. Manuel reset — dışa açık, kullanıcı ESC veya buton ile tetikleyebilir
  // ==========================================================================
  const resetMatch = useCallback(() => {
    setFocusedImage(null);
    lastFocusRef.current = null;
    lastInputRef.current = '';
    recentShownRef.current.clear();
    if (interimTimerRef.current) {
      clearTimeout(interimTimerRef.current);
      interimTimerRef.current = null;
    }
  }, [setFocusedImage]);

  return { resetMatch };
}
