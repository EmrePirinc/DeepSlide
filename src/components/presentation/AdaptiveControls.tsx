'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { SpeechControls } from '@/components/speech/SpeechControls';
import { downloadSRT } from '@/lib/subtitle/srtExporter';
import { useTranscriptStore } from '@/stores/transcriptStore';
import type { SpeechProviderType } from '@/types/presentation';

interface AdaptiveControlsProps {
  onExit: () => void;
  onTogglePause: () => void;
  isPaused: boolean;
  speechProvider: SpeechProviderType;
  lang: string;
  onSpeechStart: (provider: SpeechProviderType, lang: string) => void;
  onSpeechStop: () => void;
  presentationTitle?: string;
}

export function AdaptiveControls({
  onExit,
  onTogglePause,
  isPaused,
  speechProvider,
  lang,
  onSpeechStart,
  onSpeechStop,
  presentationTitle = 'sunum',
}: AdaptiveControlsProps) {
  const { entries, getWordCount } = useTranscriptStore();
  const canDownloadSRT = getWordCount() >= 50;
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideAfterDelay = useCallback((ms: number = 5000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), ms);
  }, []);

  const showControls = useCallback(() => {
    setVisible(true);
    hideAfterDelay();
  }, [hideAfterDelay]);

  // İlk gösterimden sonra 3sn bekle
  useEffect(() => {
    hideAfterDelay(3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hideAfterDelay]);

  // Alt kenara fare/dokunma ile göster
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY > window.innerHeight * 0.9) showControls();
    };
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0].clientY > window.innerHeight * 0.9) showControls();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [showControls]);

  return (
    <>
      {/* Mikrofon göstergesi — her zaman görünür */}
      <div className="fixed bottom-4 right-4 z-50">
        <SpeechControls
          onStart={onSpeechStart}
          onStop={onSpeechStop}
          provider={speechProvider}
          lang={lang}
          compact
        />
      </div>

      {/* Adaptif kontrol paneli */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-40
          bg-black/80 backdrop-blur-sm
          transition-transform duration-200
          ${visible ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={onTogglePause}
            >
              {isPaused ? '▶ Devam' : '⏸ Duraklat'}
            </Button>
            <SpeechControls
              onStart={onSpeechStart}
              onStop={onSpeechStop}
              provider={speechProvider}
              lang={lang}
            />
            {canDownloadSRT && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/20"
                onClick={() => downloadSRT(entries, presentationTitle)}
                title="Alt yazıyı SRT olarak indir"
              >
                ↓ SRT
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={onExit}
          >
            ✕ Çıkış
          </Button>
        </div>
      </div>
    </>
  );
}
