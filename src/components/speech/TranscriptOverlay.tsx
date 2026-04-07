'use client';

import { useSpeechStore } from '@/stores/speechStore';

interface TranscriptOverlayProps {
  visible?: boolean;
}

export function TranscriptOverlay({ visible = true }: TranscriptOverlayProps) {
  const { transcript, interimTranscript, matches } = useSpeechStore();

  if (!visible) return null;

  const displayText = interimTranscript || transcript;
  if (!displayText && matches.length === 0) return null;

  // Son 5 kelimeyi göster
  const words = displayText.split(/\s+/).slice(-5).join(' ');

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-black/60 backdrop-blur-sm text-white rounded-lg px-4 py-2 max-w-md">
        {words && (
          <p className="text-center text-sm">
            {words}
          </p>
        )}
        {matches.length > 0 && (
          <div className="flex justify-center gap-1 mt-1">
            {matches.slice(0, 3).map((m, i) => (
              <span
                key={i}
                className="text-xs bg-primary/80 rounded px-1.5 py-0.5"
              >
                {m.keyword} ({Math.round(m.score * 100)}%)
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
