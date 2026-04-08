'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SpeechControls } from '@/components/speech/SpeechControls';
import { RehearsalScore } from './RehearsalScore';
import { useRehearsalMode } from '@/hooks/useRehearsalMode';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { SpeechProviderType } from '@/types/presentation';

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

  const handleStart = () => {
    startRehearsal();
    startSpeech(speechProvider, lang);
  };

  const handleStop = () => {
    stopSpeech();
    stopRehearsal();
  };

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
            Prova modunda konuşun. Eşleşen kelimeler yeşil,
            eşleşmeyenler kırmızı gösterilecek.
          </p>
          <Button onClick={handleStart}>Provaya Başla</Button>
        </Card>
      )}

      {isRehearsal && (
        <Card className="p-4 space-y-4">
          <SpeechControls
            onStart={startSpeech}
            onStop={stopSpeech}
            provider={speechProvider}
            lang={lang}
          />

          <div className="min-h-32 p-4 bg-muted rounded-md">
            <div className="flex flex-wrap gap-1">
              {words.map((word, i) => (
                <span
                  key={i}
                  className={`
                    px-1.5 py-0.5 rounded text-sm font-medium
                    ${word.matched
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }
                  `}
                  title={
                    word.matched
                      ? `Eşleşti: ${word.matchedKeyword}`
                      : 'Eşleşme yok'
                  }
                >
                  {word.text}
                </span>
              ))}
              {words.length === 0 && (
                <span className="text-muted-foreground text-sm">
                  Konuşmaya başlayın...
                </span>
              )}
            </div>
          </div>

          <Button variant="destructive" onClick={handleStop}>
            Provayı Bitir
          </Button>
        </Card>
      )}

      {result && (
        <RehearsalScore
          result={result}
          onAddSynonym={onAddSynonym}
          onRetry={() => {
            handleStart();
          }}
        />
      )}
    </div>
  );
}
