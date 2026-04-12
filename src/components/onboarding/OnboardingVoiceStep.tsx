// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, CheckCircle } from 'lucide-react';

interface OnboardingVoiceStepProps {
  onSuccess: () => void;
  onSkip: () => void;
}

const TARGET_WORD = 'deepslide';

export function OnboardingVoiceStep({ onSuccess, onSkip }: OnboardingVoiceStepProps) {
  const [state, setState] = useState<'idle' | 'listening' | 'success' | 'denied'>('idle');
  const [transcript, setTranscript] = useState('');

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onSkip();
      return;
    }

    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) { onSkip(); return; }

    // Request mic permission first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setState('listening');
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = 'tr-TR';
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.maxAlternatives = 3;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const text = event.results[i][0].transcript.toLowerCase();
            setTranscript(text);
            if (text.includes(TARGET_WORD)) {
              recognition.stop();
              setState('success');
              setTimeout(() => onSuccess(), 1200);
              return;
            }
          }
        };

        recognition.onerror = () => {
          setState('idle');
        };

        recognition.start();

        // Auto-stop after 30s
        setTimeout(() => {
          try { recognition.stop(); } catch { /* ignore */ }
          if (state === 'listening') setState('idle');
        }, 30000);
      })
      .catch(() => {
        setState('denied');
      });
  }, [onSuccess, onSkip, state]);

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      <div className="text-center">
        <h3 className="text-base font-semibold mb-1">Ses Kontrolünü Test Et</h3>
        <p className="text-sm text-muted-foreground">
          Mikrofona &ldquo;<strong>deepslide</strong>&rdquo; deyin
        </p>
      </div>

      {/* Mic button */}
      <AnimatePresence mode="wait">
        {state === 'success' ? (
          <motion.div
            key="success"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <CheckCircle size={56} className="text-green-500" />
            <p className="text-sm font-medium text-green-600 dark:text-green-400">Harika! Ses kontrolü çalışıyor 🎉</p>
          </motion.div>
        ) : state === 'denied' ? (
          <motion.div key="denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-3">
            <MicOff size={40} className="mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Mikrofon erişimi reddedildi</p>
            <p className="text-xs text-muted-foreground">Ses kontrolünü daha sonra tarayıcı ayarlarından etkinleştirebilirsiniz.</p>
          </motion.div>
        ) : (
          <motion.button
            key="mic"
            onClick={startListening}
            disabled={state === 'listening'}
            whileTap={{ scale: 0.95 }}
            className={`relative rounded-full p-6 transition-colors ${
              state === 'listening'
                ? 'bg-red-500/20 text-red-500 cursor-default'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            <Mic size={40} />
            {state === 'listening' && (
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-red-400"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {state === 'listening' && (
        <p className="text-xs text-muted-foreground animate-pulse">
          Dinleniyor… {transcript && <span className="text-foreground">&ldquo;{transcript}&rdquo;</span>}
        </p>
      )}

      {state !== 'success' && (
        <button
          onClick={onSkip}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          Mikrofonsuz devam et
        </button>
      )}
    </div>
  );
}
