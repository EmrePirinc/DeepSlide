'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ollamaClient, type OllamaModel } from '@/lib/localAI/client';

export interface LocalAIState {
  available: boolean;
  checking: boolean;
  models: OllamaModel[];
  activeModel: string | null;
}

export interface UseLocalAIReturn extends LocalAIState {
  setActiveModel: (modelId: string) => void;
  generate: (prompt: string, onChunk: (text: string) => void) => Promise<void>;
  chat: (
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    onChunk: (text: string) => void
  ) => Promise<void>;
  refreshModels: () => Promise<void>;
}

// DeepSlide için tercih sırası — küçükten büyüğe
const PREFERRED_MODELS = ['gemma2:2b', 'llama3.2:3b', 'phi3.5:3.8b', 'mistral:7b'];

function pickDefaultModel(models: OllamaModel[]): string | null {
  for (const preferred of PREFERRED_MODELS) {
    const found = models.find((m) => m.name.startsWith(preferred.split(':')[0]));
    if (found) return found.name;
  }
  return models[0]?.name ?? null;
}

// Companion app yoksa polling aralığı kademeli artar: 8s → 16s → 32s → max 60s
const POLL_BASE_MS = 8_000;
const POLL_MAX_MS = 60_000;

export function useLocalAI(): UseLocalAIReturn {
  const [state, setState] = useState<LocalAIState>({
    available: false,
    checking: true,
    models: [],
    activeModel: null,
  });

  const activeModelRef = useRef<string | null>(null);
  activeModelRef.current = state.activeModel;
  const failCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAndLoad = useCallback(async () => {
    const available = await ollamaClient.isAvailable();

    if (!available) {
      failCountRef.current += 1;
      setState((prev) => ({ ...prev, available: false, checking: false, models: [] }));

      // Exponential backoff: 8s → 16s → 32s → 60s (max)
      const delay = Math.min(POLL_BASE_MS * Math.pow(2, failCountRef.current - 1), POLL_MAX_MS);
      timerRef.current = setTimeout(checkAndLoad, delay);
      return;
    }

    // Bağlantı kuruldu — backoff sıfırla
    failCountRef.current = 0;

    const models = await ollamaClient.listModels();
    const currentActive = activeModelRef.current;
    const stillAvailable = currentActive && models.some((m) => m.name === currentActive);
    const activeModel = stillAvailable ? currentActive : pickDefaultModel(models);

    setState({ available: true, checking: false, models, activeModel });

    // Bağlı durumdayken sabit 8s'de bir kontrol et
    timerRef.current = setTimeout(checkAndLoad, POLL_BASE_MS);
  }, []);

  // İlk yükleme
  useEffect(() => {
    checkAndLoad();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [checkAndLoad]);

  const setActiveModel = useCallback((modelId: string) => {
    setState((prev) => ({ ...prev, activeModel: modelId }));
  }, []);

  const generate = useCallback(
    async (prompt: string, onChunk: (text: string) => void) => {
      const model = activeModelRef.current;
      if (!model) throw new Error('Aktif model seçili değil');

      for await (const chunk of ollamaClient.generate(model, prompt)) {
        onChunk(chunk);
      }
    },
    []
  );

  const chat = useCallback(
    async (
      messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
      onChunk: (text: string) => void
    ) => {
      const model = activeModelRef.current;
      if (!model) throw new Error('Aktif model seçili değil');

      for await (const chunk of ollamaClient.chat(model, messages)) {
        onChunk(chunk);
      }
    },
    []
  );

  const refreshModels = useCallback(async () => {
    await checkAndLoad();
  }, [checkAndLoad]);

  return { ...state, setActiveModel, generate, chat, refreshModels };
}
