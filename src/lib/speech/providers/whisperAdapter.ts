// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { SpeechProviderInterface, TranscriptResult } from '../types';

/**
 * Whisper WASM adapter — çevrimdışı ses tanıma.
 * Şu an placeholder implementasyonu. Whisper WASM entegrasyonu Faz 2'de tamamlanacak.
 * Model indirme + WASM çalıştırma gerektirir (~200MB).
 */
export class WhisperAdapter implements SpeechProviderInterface {
  name = 'Whisper (Çevrimdışı)';
  onTranscript: ((result: TranscriptResult) => void) | null = null;
  onError: ((error: Error) => void) | null = null;

  private modelLoaded = false;

  isAvailable(): boolean {
    // Whisper WASM henüz entegre edilmediğinden false döndür
    // TODO: Model indirilip indirilmediğini kontrol et
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  start(_lang: string): void {
    if (!this.isAvailable()) {
      this.onError?.(
        new Error(
          'Whisper modeli henüz indirilmedi. Çevrimiçiyken model indirilmesi gerekiyor.'
        )
      );
      return;
    }

    // TODO: Whisper WASM entegrasyonu
    // 1. Web Worker başlat
    // 2. MediaRecorder ile ses al
    // 3. Audio chunk'ları worker'a gönder
    // 4. Whisper inference sonucunu transcript olarak döndür
  }

  stop(): void {
    // TODO: Worker'ı durdur, MediaRecorder'ı kapat
  }

  /**
   * Whisper modelini arkaplanda indirir ve IndexedDB'ye cache'ler.
   * TODO: Gerçek implementasyon
   */
  async downloadModel(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _onProgress?: (percent: number) => void
  ): Promise<void> {
    // TODO: Model indirme implementasyonu
    // 1. Model URL'den fetch
    // 2. Progress callback ile ilerleme bildir
    // 3. IndexedDB'ye cache'le
    // 4. this.modelLoaded = true
    throw new Error('Whisper model indirme henüz implemente edilmedi');
  }
}
