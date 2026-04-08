// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Animasyon Orchestrator.
 * Keyword eşleşmesi sonrası görsel relevance skorunu yönetir.
 * Temporal decay: eşleşme sonrası her 2 saniyede -0.1, <0.3'te geri küçülme.
 */
export class AnimationOrchestrator {
  private relevanceScores = new Map<string, number>();
  private decayInterval: ReturnType<typeof setInterval> | null = null;
  private onChange: ((activeIds: string[]) => void) | null = null;

  private readonly DECAY_INTERVAL_MS = 2000;
  private readonly DECAY_AMOUNT = 0.1;
  private readonly DEACTIVATE_THRESHOLD = 0.3;

  /**
   * Değişiklik callback'i ayarla.
   */
  setOnChange(callback: (activeIds: string[]) => void): void {
    this.onChange = callback;
  }

  /**
   * Eşleşen görsel ID'lerini aktive et (relevance = 1.0).
   */
  activateImages(imageIds: string[]): void {
    for (const id of imageIds) {
      this.relevanceScores.set(id, 1.0);
    }
    this.notifyChange();
    this.ensureDecayRunning();
  }

  /**
   * Belirli bir görselin relevance skorunu döndürür.
   */
  getRelevance(imageId: string): number {
    return this.relevanceScores.get(imageId) ?? 0;
  }

  /**
   * Aktif görsel ID'lerini döndürür (threshold üstü).
   */
  getActiveIds(): string[] {
    const active: string[] = [];
    for (const [id, score] of this.relevanceScores) {
      if (score >= this.DEACTIVATE_THRESHOLD) {
        active.push(id);
      }
    }
    return active;
  }

  /**
   * Decay döngüsünü başlat.
   */
  private ensureDecayRunning(): void {
    if (this.decayInterval) return;

    this.decayInterval = setInterval(() => {
      let changed = false;

      for (const [id, score] of this.relevanceScores) {
        const newScore = score - this.DECAY_AMOUNT;

        if (newScore < this.DEACTIVATE_THRESHOLD) {
          this.relevanceScores.delete(id);
          changed = true;
        } else {
          this.relevanceScores.set(id, newScore);
          changed = true;
        }
      }

      if (changed) {
        this.notifyChange();
      }

      // Hiç aktif görsel kalmadıysa decay'i durdur
      if (this.relevanceScores.size === 0 && this.decayInterval) {
        clearInterval(this.decayInterval);
        this.decayInterval = null;
      }
    }, this.DECAY_INTERVAL_MS);
  }

  /**
   * Aktif görsel listesini callback ile bildir.
   */
  private notifyChange(): void {
    this.onChange?.(this.getActiveIds());
  }

  /**
   * Tüm state'i temizle.
   */
  reset(): void {
    this.relevanceScores.clear();
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
      this.decayInterval = null;
    }
    this.notifyChange();
  }

  /**
   * Cleanup.
   */
  destroy(): void {
    this.reset();
    this.onChange = null;
  }
}
