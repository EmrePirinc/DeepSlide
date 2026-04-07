'use client';

import { useSpeechStore } from '@/stores/speechStore';

export function MatchIndicator() {
  const { matches, isListening } = useSpeechStore();

  if (!isListening) return null;

  return (
    <div className="flex items-center gap-2">
      {matches.length > 0 ? (
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Eşleşme:</span>
          {matches.slice(0, 3).map((m, i) => (
            <span
              key={i}
              className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded px-1.5 py-0.5"
            >
              {m.keyword} → {m.imageIds.length} görsel
            </span>
          ))}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">
          Eşleşme bekleniyor...
        </span>
      )}
    </div>
  );
}
