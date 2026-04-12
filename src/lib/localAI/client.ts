// DeepSlide — Ollama REST istemcisi
// Companion app üzerinden localhost:11434'e bağlanır

const OLLAMA_BASE = 'http://localhost:11434';
const DETECT_TIMEOUT_MS = 2000;

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
}

export interface PullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl = OLLAMA_BASE) {
    this.baseUrl = baseUrl;
  }

  // Companion app çalışıyor mu?
  // Not: Ollama kurulu değilse browser console'da ERR_CONNECTION_REFUSED görünür
  // — bu beklenen bir durumdur, hata değildir.
  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/version`, {
        signal: AbortSignal.timeout(DETECT_TIMEOUT_MS),
        // Cache'leme — aynı saniye içinde tekrar sorgulamayı engeller
        cache: 'no-store',
      });
      return res.ok;
    } catch {
      // ERR_CONNECTION_REFUSED: Companion app çalışmıyor (beklenen durum)
      return false;
    }
  }

  // Kurulu modelleri listele
  async listModels(): Promise<OllamaModel[]> {
    const res = await fetch(`${this.baseUrl}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json() as { models: OllamaModel[] };
    return data.models ?? [];
  }

  // Streaming metin üretimi — async generator döndürür
  async *generate(
    model: string,
    prompt: string,
    options?: {
      temperature?: number;
      system?: string;
    }
  ): AsyncGenerator<string> {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: true,
        options: { temperature: options?.temperature ?? 0.7 },
        ...(options?.system ? { system: options.system } : {}),
      }),
    });

    if (!res.body) throw new Error('Streaming desteklenmiyor');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
        for (const line of lines) {
          const chunk = JSON.parse(line) as { response: string; done: boolean };
          if (chunk.response) yield chunk.response;
          if (chunk.done) return;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Chat tamamlama (OpenAI uyumlu format)
  async *chat(
    model: string,
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    options?: { temperature?: number }
  ): AsyncGenerator<string> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        options: { temperature: options?.temperature ?? 0.7 },
      }),
    });

    if (!res.body) throw new Error('Streaming desteklenmiyor');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
        for (const line of lines) {
          const chunk = JSON.parse(line) as {
            message?: { content: string };
            done: boolean;
          };
          if (chunk.message?.content) yield chunk.message.content;
          if (chunk.done) return;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Model indir — progress callback ile, iptal destekli
  async *pullModel(modelName: string, signal?: AbortSignal): AsyncGenerator<PullProgress> {
    const res = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: true }),
      signal,
    });

    if (!res.body) throw new Error('Streaming desteklenmiyor');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
        for (const line of lines) {
          yield JSON.parse(line) as PullProgress;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Model sil
  async deleteModel(modelName: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName }),
    });
    return res.ok;
  }
}

// Singleton — tüm app tek istemci kullanır
export const ollamaClient = new OllamaClient();
