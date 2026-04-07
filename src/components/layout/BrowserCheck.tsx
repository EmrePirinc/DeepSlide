'use client';

import { useSyncExternalStore } from 'react';
import { Card } from '@/components/ui/card';

function getWarning(): string | null {
  if (typeof window === 'undefined') return null;
  const hasSpeech =
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  if (!hasSpeech) {
    return 'Bu tarayıcı Web Speech API desteklemiyor. Sesle kontrol için Chrome, Edge veya Safari kullanın.';
  }
  return null;
}

const subscribe = () => () => {};
const getSnapshot = () => getWarning();
const getServerSnapshot = () => null;

export function BrowserCheck() {
  const warning = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!warning) return null;

  return (
    <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 p-3 mb-4">
      <p className="text-sm text-yellow-800 dark:text-yellow-200">
        {warning}
      </p>
    </Card>
  );
}
