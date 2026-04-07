import type { SpeechProviderInterface, TranscriptResult } from '../types';

/**
 * Web Speech API adapter.
 * Chrome, Edge, Safari destekler. Firefox desteklemez.
 */
export class WebSpeechAdapter implements SpeechProviderInterface {
  name = 'Web Speech API';
  onTranscript: ((result: TranscriptResult) => void) | null = null;
  onError: ((error: Error) => void) | null = null;

  private recognition: SpeechRecognition | null = null;
  private isActive = false;

  isAvailable(): boolean {
    return typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  start(lang: string): void {
    if (!this.isAvailable()) {
      this.onError?.(new Error('Web Speech API bu tarayıcıda desteklenmiyor'));
      return;
    }

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    this.recognition = new SpeechRecognitionClass();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = lang;
    this.recognition.maxAlternatives = 3;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const words = transcript
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 0);

      this.onTranscript?.({
        text: transcript,
        words,
        isFinal: result.isFinal,
        confidence: result[0].confidence,
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'no-speech' ve 'aborted' hataları normal akışta oluşabilir
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        this.onError?.(new Error(`Speech error: ${event.error}`));
      }
    };

    // Tarayıcı sessizlikte durduğunda otomatik yeniden başlat
    this.recognition.onend = () => {
      if (this.isActive) {
        try {
          this.recognition?.start();
        } catch {
          // Zaten çalışıyor olabilir
        }
      }
    };

    this.isActive = true;
    this.recognition.start();
  }

  stop(): void {
    this.isActive = false;
    this.recognition?.stop();
    this.recognition = null;
  }
}
