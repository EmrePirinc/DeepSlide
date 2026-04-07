'use client';

import { Button } from '@/components/ui/button';
import { useSpeechStore } from '@/stores/speechStore';
import type { SpeechProviderType } from '@/types/presentation';

interface SpeechControlsProps {
  onStart: (provider: SpeechProviderType, lang: string) => void;
  onStop: () => void;
  provider: SpeechProviderType;
  lang: string;
  compact?: boolean;
}

export function SpeechControls({
  onStart,
  onStop,
  provider,
  lang,
  compact = false,
}: SpeechControlsProps) {
  const { isListening, error } = useSpeechStore();

  const handleToggle = () => {
    if (isListening) {
      onStop();
    } else {
      onStart(provider, lang);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center transition-all
          ${isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-white/20 text-white hover:bg-white/30'
          }
        `}
        title={isListening ? 'Ses tanımayı durdur' : 'Ses tanımayı başlat'}
      >
        {isListening ? '⏹' : '🎤'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={isListening ? 'destructive' : 'default'}
        size="sm"
        onClick={handleToggle}
      >
        {isListening ? '⏹ Durdur' : '🎤 Dinlemeye Başla'}
      </Button>

      {isListening && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">Dinleniyor...</span>
        </div>
      )}

      {error && (
        <span className="text-xs text-destructive">{error}</span>
      )}
    </div>
  );
}
