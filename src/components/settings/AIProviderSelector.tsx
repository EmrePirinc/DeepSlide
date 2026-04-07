'use client';

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
    value: 'qwen' as AIProviderType,
    label: 'Qwen 3.5 (Yerel)',
    description: 'Qwen3.5 9B — Ollama ile yerel çalışır. Sınırsız, ücretsiz, rate limit yok.',
  },
  {
    value: 'gemma' as AIProviderType,
    label: 'Gemma 4 (Yerel)',
    description: 'Google Gemma4 E2B — Ollama ile yerel, hızlı ve multimodal.',
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
];
