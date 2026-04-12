// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Animasyon Orchestrator.
 *
 * Prezi modu: sesle eşleşen tek görsel tam ekrana odaklanır.
 * Orchestrator, `focusImage()` üzerinden çalışır — en iyi skoru olan
 * tek bir görsel seçilir, diğerleri devre dışı kalır.
 *
 * Overview timeout: 10sn (ayarlanabilir) sessizlik sonrası overview'e dönüş.
 * Temporal decay: eski eşleşme skoru zamanla düşer — yeni keyword gelince geçiş yapar.
 */
export class AnimationOrchestrator {
  private relevanceScores = new Map<string, number>();
  private decayInterval: ReturnType<typeof setInterval> | null = null;
  private onChange: ((activeIds: string[], focusedId: string | null) => void) | null = null;
  private currentFocusedId: string | null = null;

  // Hız ayarları: yeni keyword geldiğinde eskisi kısa sürede pasifleşmeli.
  // 1.0 → 0.3 geçiş süresi ≈ (1.0-0.3)/DECAY_AMOUNT × INTERVAL = 7 × 500 = 3.5sn
  private readonly DECAY_INTERVAL_MS = 500;
  private readonly DECAY_AMOUNT = 0.1;
  private readonly DEACTIVATE_THRESHOLD = 0.3;

  /**
   * Değişiklik callback'i ayarla.
   * activeIds: threshold üstü tüm görsel ID'leri
   * focusedId: en yüksek skora sahip tek görsel (Prezi zoom hedefi)
   */
  setOnChange(callback: (activeIds: string[], focusedId: string | null) => void): void {
    this.onChange = callback;
  }

  /**
   * Eşleşen görsel ID'lerini aktive et (relevance = 1.0).
   * Geriye uyumluluk için korundu.
   */
  activateImages(imageIds: string[]): void {
    for (const id of imageIds) {
      this.relevanceScores.set(id, 1.0);
    }
    this.updateFocus();
    this.notifyChange();
    this.ensureDecayRunning();
  }

  /**
   * Tek görsel odakla — en iyi keyword match sonucundan çağrılır.
   * Diğer görsellerin relevance skoru decay'e devam eder.
   *
   * Aynı görsele tekrar focus çağrılırsa skor'u tazeler ama gereksiz
   * notifyChange (re-render) tetiklemez — interim transcript güncellemelerinde
   * stutter'ı önler.
   */
  focusImage(imageId: string, score: number = 1.0): void {
    const newScore = Math.min(1.0, score);
    const prevFocusedId = this.currentFocusedId;
    const prevScore = this.relevanceScores.get(imageId) ?? 0;

    // Skoru her durumda tazele (decay reset)
    this.relevanceScores.set(imageId, newScore);
    this.currentFocusedId = imageId;
    this.ensureDecayRunning();

    // Focus değişmediyse VE skor farkı önemsizse re-render atla
    const focusUnchanged = prevFocusedId === imageId;
    const scoreNegligible = Math.abs(newScore - prevScore) < 0.05;
    if (focusUnchanged && scoreNegligible) return;

    this.notifyChange();
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
   * Mevcut odaklanılan görsel ID'sini döndürür.
   */
  getFocusedId(): string | null {
    return this.currentFocusedId;
  }

  /**
   * Decay sonrası en yüksek skora sahip görseli focused olarak güncelle.
   */
  private updateFocus(): void {
    let maxScore = 0;
    let maxId: string | null = null;

    for (const [id, score] of this.relevanceScores) {
      if (score > maxScore) {
        maxScore = score;
        maxId = id;
      }
    }

    this.currentFocusedId = maxScore >= this.DEACTIVATE_THRESHOLD ? maxId : null;
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
        this.updateFocus();
        this.notifyChange();
      }

      if (this.relevanceScores.size === 0 && this.decayInterval) {
        clearInterval(this.decayInterval);
        this.decayInterval = null;
      }
    }, this.DECAY_INTERVAL_MS);
  }

  private notifyChange(): void {
    this.onChange?.(this.getActiveIds(), this.currentFocusedId);
  }

  reset(): void {
    this.relevanceScores.clear();
    this.currentFocusedId = null;
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
      this.decayInterval = null;
    }
    this.notifyChange();
  }

  destroy(): void {
    this.reset();
    this.onChange = null;
  }
}
