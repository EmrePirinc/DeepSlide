'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import type { AIProviderType, SpeechProviderType } from '@/types/presentation';

interface AIProviderSelectorProps {
  label: string;
  value: string;
  options: { value: string; label: string; description: string }[];
  onChange: (value: string) => void;
}

export function ProviderSelector({
  label,
  value,
  options,
  onChange,
}: AIProviderSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="grid gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-colors
              ${value === option.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}
            `}
          >
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium">{option.label}</p>
              <p className="text-xs text-muted-foreground">
                {option.description}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

export const IMAGE_PROVIDER_OPTIONS = [
  {
    value: 'gemini' as AIProviderType,
    label: 'Google Gemini',
    description: 'Gemini 2.5 Flash — Hızlı ve uygun maliyetli görsel analiz',
  },
  {
    value: 'ollama' as AIProviderType,
    label: 'Local AI (Ollama)',
    description: 'Bilgisayarında çalışır — internet gerektirmez, ücretsiz',
  },
];

export const SPEECH_PROVIDER_OPTIONS = [
  {
    value: 'webSpeech' as SpeechProviderType,
    label: 'Web Speech API',
    description: 'Tarayıcı tabanlı, ücretsiz. Chrome/Edge/Safari.',
  },
  {
    value: 'gemini' as SpeechProviderType,
    label: 'Gemini Ses',
    description: 'Yüksek doğruluk, ücretli. Türkçe desteği güçlü.',
  },
  {
    value: 'whisper' as SpeechProviderType,
    label: 'Whisper (Çevrimdışı)',
    description: 'Çevrimdışı çalışır. İlk seferde model indirilir (~200MB).',
  },
  {
    value: 'deepgram' as SpeechProviderType,
    label: 'Deepgram Nova-2',
    description: 'Gürültülü ortamda yüksek doğruluk. Türkçe desteği güçlü. Pro özellik.',
  },
];
