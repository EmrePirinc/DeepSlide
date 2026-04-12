// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Circle, Mic } from 'lucide-react';
import type { PresentationImage } from '@/types/presentation';

interface PrePresentationCheckProps {
  images: PresentationImage[];
  presentationId: string;
  onStart: () => void;
  onSkip: () => void;
}

interface KeywordState {
  text: string;
  matched: boolean;
}

function getScoreColor(pct: number) {
  if (pct >= 80) return 'text-green-500';
  if (pct >= 60) return 'text-yellow-500';
  return 'text-orange-500';
}

export function PrePresentationCheck({
  images,
  onStart,
  onSkip,
}: PrePresentationCheckProps) {
  const firstThreeImages = images.slice(0, 3);
  const allKeywords: KeywordState[] = firstThreeImages.flatMap((img) =>
    img.keywords.slice(0, 5).map((kw) => ({ text: kw.text, matched: false })),
  );

  const [keywords, setKeywords] = useState<KeywordState[]>(allKeywords);
  const [isListening, setIsListening] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [done, setDone] = useState(false);

  const matchedCount = keywords.filter((k) => k.matched).length;
  const total = keywords.length;
  const pct = total > 0 ? Math.round((matchedCount / total) * 100) : 0;

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onSkip();
      return;
    }

    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) { onSkip(); return; }

    setIsListening(true);
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'tr-TR';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const spoken = event.results[i][0].transcript.toLowerCase();
        setKeywords((prev) =>
          prev.map((kw) =>
            !kw.matched && spoken.includes(kw.text.toLowerCase())
              ? { ...kw, matched: true }
              : kw,
          ),
        );
      }
    };

    recognition.start();

    // Auto-stop and finish
    const stopTimer = setTimeout(() => {
      try { recognition.stop(); } catch { /* ignore */ }
      setIsListening(false);
      setDone(true);
    }, 120000);

    return () => { clearTimeout(stopTimer); try { recognition.stop(); } catch { /* ignore */ } };
  }, [onSkip]);

  // Count-down timer
  useEffect(() => {
    if (!isListening) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(t); setDone(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isListening]);

  // Auto-complete when all matched
  useEffect(() => {
    if (keywords.length > 0 && keywords.every((k) => k.matched)) {
      setIsListening(false);
      setDone(true);
    }
  }, [keywords]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Sunuma Hazır mısınız?</h2>
          {isListening && (
            <span className="text-sm text-muted-foreground font-mono">{formatTime(secondsLeft)}</span>
          )}
        </div>

        {!isListening && !done ? (
          <div className="flex flex-col items-center gap-5 py-4">
            <p className="text-sm text-muted-foreground text-center">
              İlk 3 slaytın anahtar kelimelerini prova edin. Söyledikçe yeşile dönecek.
            </p>
            <button
              onClick={startListening}
              className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition-opacity"
            >
              <Mic size={18} />
              Provaya Başla
            </button>
            <button onClick={onSkip} className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 underline">
              Atla, Hemen Başlat
            </button>
          </div>
        ) : (
          <>
            {/* Keywords */}
            <div className="space-y-3 mb-5">
              {firstThreeImages.map((img, imgIdx) => (
                <div key={img.id}>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Slayt {imgIdx + 1}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {img.keywords.slice(0, 5).map((kw) => {
                      const kwState = keywords.find((k) => k.text === kw.text);
                      return (
                        <motion.span
                          key={kw.id}
                          layout
                          animate={{ backgroundColor: kwState?.matched ? '#22c55e20' : '#71717a20' }}
                          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                            kwState?.matched
                              ? 'border-green-500/30 text-green-600 dark:text-green-400'
                              : 'border-border text-muted-foreground'
                          }`}
                        >
                          {kwState?.matched ? <CheckCircle size={11} /> : <Circle size={11} />}
                          {kw.text}
                        </motion.span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Score */}
            {(done || matchedCount > 0) && (
              <AnimatePresence>
                <motion.div
                  key="score"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-4"
                >
                  <p className={`text-3xl font-bold ${getScoreColor(pct)}`}>%{pct}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {matchedCount}/{total} keyword eşleşti
                  </p>
                </motion.div>
              </AnimatePresence>
            )}

            <div className="flex gap-3">
              <button
                onClick={onSkip}
                className="flex-1 rounded-xl border py-2.5 text-sm hover:bg-muted transition-colors"
              >
                Atla
              </button>
              <button
                onClick={onStart}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  pct >= 60
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                {done ? '🚀 Sunumu Başlat' : 'Başlat'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
