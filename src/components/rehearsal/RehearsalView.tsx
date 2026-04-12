'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SpeechControls } from '@/components/speech/SpeechControls';
import { RehearsalScore } from './RehearsalScore';
import { useRehearsalMode } from '@/hooks/useRehearsalMode';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { SpeechProviderType } from '@/types/presentation';

// Turkish + common filler words
const FILLER_WORDS = new Set([
  'şey', 'ee', 'um', 'ım', 'eh', 'yani', 'işte', 'efendim',
  'aslında', 'tabii', 'bilmiyorum', 'bilirsiniz', 'nasıl', 'tamam',
  'hani', 'gerçekten', 'falan', 'filan', 'özellikle', 'mesela',
  'uh', 'uhm', 'hmm', 'ya',
]);

function wpmColor(wpm: number): string {
  if (wpm < 100) return 'text-blue-500';
  if (wpm <= 160) return 'text-green-500';
  if (wpm <= 200) return 'text-yellow-500';
  return 'text-red-500';
}

function wpmLabel(wpm: number): string {
  if (wpm < 100) return 'Çok Yavaş';
  if (wpm <= 130) return 'Yavaş';
  if (wpm <= 160) return 'İdeal';
  if (wpm <= 200) return 'Hızlı';
  return 'Çok Hızlı';
}

interface RehearsalViewProps {
  speechProvider: SpeechProviderType;
  lang: string;
  threshold: number;
  onAddSynonym: (imageId: string, keywordId: string, synonym: string) => void;
  onClose: () => void;
}

export function RehearsalView({
  speechProvider,
  lang,
  threshold,
  onAddSynonym,
  onClose,
}: RehearsalViewProps) {
  const {
    isRehearsal,
    words,
    result,
    startRehearsal,
    stopRehearsal,
  } = useRehearsalMode(threshold);

  const { start: startSpeech, stop: stopSpeech } = useSpeechRecognition();

  // Ses Koçu Pro: WPM + filler tracking
  const startTimeRef = useRef<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [fillerCount, setFillerCount] = useState<Map<string, number>>(new Map());

  // Update WPM + filler counts as words come in
  useEffect(() => {
    if (!isRehearsal || words.length === 0) return;
    if (!startTimeRef.current) startTimeRef.current = Date.now();

    const elapsedMin = (Date.now() - startTimeRef.current) / 60000;
    if (elapsedMin > 0) {
      setWpm(Math.round(words.length / elapsedMin));
    }

    const newFillers = new Map<string, number>();
    for (const w of words) {
      const lower = w.text.toLowerCase().replace(/[^a-zığüşöçİĞÜŞÖÇ]/g, '');
      if (FILLER_WORDS.has(lower)) {
        newFillers.set(lower, (newFillers.get(lower) ?? 0) + 1);
      }
    }
    setFillerCount(newFillers);
  }, [words, isRehearsal]);

  const handleStart = () => {
    startTimeRef.current = null;
    setWpm(0);
    setFillerCount(new Map());
    startRehearsal();
    startSpeech(speechProvider, lang);
  };

  const handleStop = () => {
    stopSpeech();
    stopRehearsal();
  };

  const totalFillers = Array.from(fillerCount.values()).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sunum Provası</h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          Kapat
        </Button>
      </div>

      {!isRehearsal && !result && (
        <Card className="p-6 text-center space-y-4">
          <p className="text-muted-foreground">
            Prova modunda konuşun. Eşleşen kelimeler yeşil, eşleşmeyenler kırmızı gösterilecek.
          </p>
          <p className="text-xs text-muted-foreground">
            🎙️ <strong>Ses Koçu Pro:</strong> Konuşma hızı (KDK) ve dolgu kelime tespiti aktif.
          </p>
          <Button onClick={handleStart}>Provaya Başla</Button>
        </Card>
      )}

      {isRehearsal && (
        <Card className="p-4 space-y-4">
          {/* Ses Koçu Pro — canlı metrikler */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className={`text-2xl font-bold tabular-nums ${wpmColor(wpm)}`}>{wpm}</p>
              <p className="text-[10px] text-muted-foreground">KDK</p>
              {wpm > 0 && <p className={`text-[10px] font-medium ${wpmColor(wpm)}`}>{wpmLabel(wpm)}</p>}
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold tabular-nums">{words.length}</p>
              <p className="text-[10px] text-muted-foreground">Kelime</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className={`text-2xl font-bold tabular-nums ${totalFillers > 5 ? 'text-orange-500' : ''}`}>
                {totalFillers}
              </p>
              <p className="text-[10px] text-muted-foreground">Dolgu Kelime</p>
            </div>
          </div>

          {/* Top filler words */}
          {fillerCount.size > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {Array.from(fillerCount.entries())
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([word, count]) => (
                  <span
                    key={word}
                    className="rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 text-xs"
                  >
                    "{word}" × {count}
                  </span>
                ))}
            </div>
          )}

          <SpeechControls
            onStart={startSpeech}
            onStop={stopSpeech}
            provider={speechProvider}
            lang={lang}
          />

          <div className="min-h-32 p-4 bg-muted rounded-md">
            <div className="flex flex-wrap gap-1">
              {words.map((word, i) => {
                const lower = word.text.toLowerCase().replace(/[^a-zığüşöçİĞÜŞÖÇ]/g, '');
                const isFiller = FILLER_WORDS.has(lower);
                return (
                  <span
                    key={i}
                    className={`px-1.5 py-0.5 rounded text-sm font-medium ${
                      isFiller
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 underline decoration-dotted'
                        : word.matched
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-muted-foreground/10 text-muted-foreground'
                    }`}
                    title={
                      isFiller
                        ? '⚠️ Dolgu kelime'
                        : word.matched
                        ? `✓ Eşleşti: ${word.matchedKeyword}`
                        : 'Eşleşme yok'
                    }
                  >
                    {word.text}
                  </span>
                );
              })}
              {words.length === 0 && (
                <span className="text-muted-foreground text-sm">Konuşmaya başlayın...</span>
              )}
            </div>
          </div>

          {/* WPM gauge bar */}
          {wpm > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Çok Yavaş</span><span>İdeal (130-160)</span><span>Çok Hızlı</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${wpmColor(wpm).replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min(100, (wpm / 250) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <Button variant="destructive" onClick={handleStop}>
            Provayı Bitir
          </Button>
        </Card>
      )}

      {result && (
        <RehearsalScore
          result={result}
          onAddSynonym={onAddSynonym}
          onRetry={handleStart}
        />
      )}
    </div>
  );
}
