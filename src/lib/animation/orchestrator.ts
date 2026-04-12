// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Animasyon Orchestrator.
 *
 * Prezi modu: sesle eşleşen tek görsel tam ekrana odaklanır.
 * Orchestrator, `focusImage()` üzerinden çalışır — en iyi skoru olan
 * tek bir görsel seçilir, diğerleri devre dışı kalır.
 *
 * HYSTERESIS (flicker fix): Yeni bir focus çağrısı MIN_FOCUS_HOLD_MS
 * süresi dolmadan gelirse ancak skor FOCUS_OVERRIDE_BAR üstündeyse
 * devralır. Hold süresi içinde alt skorlu aday'ların "zaman bombası"
 * olması engellenir.
 *
 * Temporal decay: eski eşleşme skoru zamanla düşer — 500ms tick,
 * 0.1 azalma → 1.0'dan 0.3'e ~3.5sn'de iner.
 */

const IS_DEV =
  typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

function orchDebug(reason: string, payload: Record<string, unknown>): void {
  if (!IS_DEV) return;
  // eslint-disable-next-line no-console
  console.debug('[orch]', reason, payload);
}

export class AnimationOrchestrator {
  private relevanceScores = new Map<string, number>();
  private decayInterval: ReturnType<typeof setInterval> | null = null;
  private onChange: ((activeIds: string[], focusedId: string | null) => void) | null = null;
  private currentFocusedId: string | null = null;

  /** Focus'un son set edildiği timestamp (Date.now). Hysteresis için. */
  private focusSetAt = 0;

  // Hız ayarları: yeni keyword geldiğinde eskisi kısa sürede pasifleşmeli.
  // 1.0 → 0.3 geçiş süresi ≈ (1.0-0.3)/DECAY_AMOUNT × INTERVAL = 7 × 500 = 3.5sn
  private readonly DECAY_INTERVAL_MS = 500;
  private readonly DECAY_AMOUNT = 0.1;
  private readonly DEACTIVATE_THRESHOLD = 0.3;

  /**
   * Bir focus'a odaklandıktan sonra minimum ne kadar süre o focus'u
   * korumak zorundayız. Bu süre içinde YENİ bir focusImage çağrısı
   * skor FOCUS_OVERRIDE_BAR üstünde değilse yok sayılır.
   */
  private readonly MIN_FOCUS_HOLD_MS = 1000;

  /**
   * Hold süresi içinde override için gereken minimum skor.
   * Yani "çok güçlü bir sinyal gelmeden" focus değişmez.
   */
  private readonly FOCUS_OVERRIDE_BAR = 0.9;

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
    this.notifyChange('activateImages');
    this.ensureDecayRunning();
  }

  /**
   * Tek görsel odakla — en iyi keyword match sonucundan çağrılır.
   * Diğer görsellerin relevance skoru decay'e devam eder.
   *
   * Hysteresis davranışı:
   *   1. Aynı görsele tekrar focus → skor tazele, re-render atla
   *   2. Farklı görsele focus, hold süresi dolmuş → geç
   *   3. Farklı görsele focus, hold süresi dolmadı:
   *      - score >= FOCUS_OVERRIDE_BAR (0.9) → override et
   *      - aksi halde → sadece skoru sakla, currentFocusedId değişmez
   */
  focusImage(imageId: string, score: number = 1.0): void {
    const newScore = Math.min(1.0, score);
    const prevFocusedId = this.currentFocusedId;
    const prevScore = this.relevanceScores.get(imageId) ?? 0;
    const now = Date.now();

    // Skoru her durumda tazele (decay reset için) — relevance haritasına yaz
    this.relevanceScores.set(imageId, newScore);
    this.ensureDecayRunning();

    // Aynı focus'a tekrar çağrı — sadece skor refresh
    if (prevFocusedId === imageId) {
      const scoreNegligible = Math.abs(newScore - prevScore) < 0.05;
      if (scoreNegligible) {
        orchDebug('focusImage/same/skip', { imageId, prevScore, newScore });
        return;
      }
      orchDebug('focusImage/same/refresh', { imageId, prevScore, newScore });
      this.notifyChange('focusImage/same/refresh');
      return;
    }

    // Farklı focus — hysteresis kontrolü
    const heldMs = now - this.focusSetAt;
    const withinHold = this.focusSetAt > 0 && heldMs < this.MIN_FOCUS_HOLD_MS;

    if (withinHold && newScore < this.FOCUS_OVERRIDE_BAR) {
      // Hold süresi içinde, skor yetersiz → focus değişmez
      orchDebug('focusImage/held', {
        imageId,
        prevFocusedId,
        newScore,
        bar: this.FOCUS_OVERRIDE_BAR,
        heldMs,
      });
      return;
    }

    // Override veya hold süresi doldu → focus değiş
    this.currentFocusedId = imageId;
    this.focusSetAt = now;
    orchDebug('focusImage/override', {
      imageId,
      prevFocusedId,
      newScore,
      heldMs,
    });
    this.notifyChange('focusImage/override');
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
   * NOT: Bu yalnızca currentFocusedId'nin relevance'ı threshold altına
   * düşerse çağrılmalı. focusImage override'ı hysteresis'e bağlıdır ve
   * updateFocus'un otomatik kararlarını bypass eder.
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
   *
   * ÖNEMLİ: Decay tick yalnızca topolojik değişimde (entry silinme,
   * currentFocusedId'nin skoru threshold altına düşme) notifyChange
   * tetikler. Skor refresh → re-render yok (flicker fix).
   */
  private ensureDecayRunning(): void {
    if (this.decayInterval) return;

    this.decayInterval = setInterval(() => {
      let topologyChanged = false;
      const focusedBefore = this.currentFocusedId;
      const focusedScoreBefore = focusedBefore
        ? this.relevanceScores.get(focusedBefore) ?? 0
        : 0;

      for (const [id, score] of this.relevanceScores) {
        const newScore = score - this.DECAY_AMOUNT;

        if (newScore < this.DEACTIVATE_THRESHOLD) {
          this.relevanceScores.delete(id);
          topologyChanged = true;
        } else {
          this.relevanceScores.set(id, newScore);
          // Sadece skor değişimi → topology değişmedi
        }
      }

      // Eğer currentFocusedId hâlâ map'te ve threshold üstündeyse,
      // focus değişmez ve notifyChange ATLA.
      const focusedStillActive =
        this.currentFocusedId !== null &&
        (this.relevanceScores.get(this.currentFocusedId) ?? 0) >= this.DEACTIVATE_THRESHOLD;

      if (!focusedStillActive) {
        // Focus artık geçerli değil — yeni focus seç (veya null)
        this.updateFocus();
        topologyChanged = true;
      }

      if (topologyChanged) {
        orchDebug('decay/tick', {
          focusedBefore,
          focusedAfter: this.currentFocusedId,
          focusedScoreBefore,
          remaining: this.relevanceScores.size,
        });
        this.notifyChange('decay/tick');
      }

      if (this.relevanceScores.size === 0 && this.decayInterval) {
        clearInterval(this.decayInterval);
        this.decayInterval = null;
      }
    }, this.DECAY_INTERVAL_MS);
  }

  private notifyChange(reason: string): void {
    orchDebug('notifyChange', {
      reason,
      focusedId: this.currentFocusedId,
      activeCount: this.getActiveIds().length,
    });
    this.onChange?.(this.getActiveIds(), this.currentFocusedId);
  }

  reset(): void {
    this.relevanceScores.clear();
    this.currentFocusedId = null;
    this.focusSetAt = 0;
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
      this.decayInterval = null;
    }
    this.notifyChange('reset');
  }

  destroy(): void {
    this.reset();
    this.onChange = null;
  }
}
