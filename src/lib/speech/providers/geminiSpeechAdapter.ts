import type { SpeechProviderInterface, TranscriptResult } from '../types';

/**
 * Gemini API ses-metin adapter'ı.
 * MediaRecorder ile ses kaydı alır, sunucu tarafı API'ye gönderir.
 * TODO: Gemini Live API entegrasyonu (streaming)
 */
export class GeminiSpeechAdapter implements SpeechProviderInterface {
  name = 'Gemini Speech';
  onTranscript: ((result: TranscriptResult) => void) | null = null;
  onError: ((error: Error) => void) | null = null;

  private mediaRecorder: MediaRecorder | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isActive = false;

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'MediaRecorder' in window;
  }

  async start(_lang: string): Promise<void> {
    if (!this.isAvailable()) {
      this.onError?.(new Error('MediaRecorder bu tarayıcıda desteklenmiyor'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      this.isActive = true;
      let chunks: Blob[] = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      this.mediaRecorder.onstop = async () => {
        if (chunks.length === 0) return;
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        chunks = [];

        try {
          const formData = new FormData();
          formData.append('audio', audioBlob);
          formData.append('lang', _lang);

          const response = await fetch('/api/speech', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            if (data.text) {
              const words = data.text
                .toLowerCase()
                .split(/\s+/)
                .filter((w: string) => w.length > 0);

              this.onTranscript?.({
                text: data.text,
                words,
                isFinal: true,
                confidence: data.confidence ?? 0.8,
              });
            }
          }
        } catch (err) {
          this.onError?.(
            err instanceof Error ? err : new Error('Speech API error')
          );
        }
      };

      // Her 3 saniyede chunk gönder
      this.mediaRecorder.start();
      this.intervalId = setInterval(() => {
        if (this.mediaRecorder?.state === 'recording') {
          this.mediaRecorder.stop();
          this.mediaRecorder.start();
        }
      }, 3000);
    } catch (err) {
      this.onError?.(
        err instanceof Error ? err : new Error('Mikrofon erişim hatası')
      );
    }
  }

  stop(): void {
    this.isActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.mediaRecorder?.stream.getTracks().forEach((t) => t.stop());
    this.mediaRecorder = null;
  }
}
