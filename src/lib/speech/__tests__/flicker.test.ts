// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnimationOrchestrator } from '../../animation/orchestrator';

/**
 * Flicker regresyon testleri — zoom'un kendiliğinden açılıp kapanmasının
 * (flicker) gerçekleşmemesini doğrular.
 *
 * 4 senaryo:
 *   F1 — Idle decay: Tek focusImage sonrası 10 tick decay çalışır, currentFocusedId
 *        threshold altına düşene kadar notifyChange yalnızca topology değişiminde.
 *   F2 — Repeated refresh: Aynı imageId'ye 50 kez focusImage → notifyChange sayısı düşük.
 *   F3 — Hold window: Focus A kurulur, 500ms sonra B (skor 0.78) gelir → değişmez.
 *   F4 — Override bar: Hold içinde B (skor 0.92) gelir → devralır.
 */
describe('AnimationOrchestrator — flicker mitigation', () => {
  let orchestrator: AnimationOrchestrator;
  let notifyCount = 0;
  let lastFocused: string | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    notifyCount = 0;
    lastFocused = null;
    orchestrator = new AnimationOrchestrator();
    orchestrator.setOnChange((_activeIds, focusedId) => {
      notifyCount++;
      lastFocused = focusedId;
    });
  });

  afterEach(() => {
    orchestrator.destroy();
    vi.useRealTimers();
  });

  it('F1: single focus + idle decay emits notifyChange minimally', () => {
    orchestrator.focusImage('img-A', 1.0);
    expect(notifyCount).toBe(1);
    expect(lastFocused).toBe('img-A');

    // 10 decay tick (5 sn) — skor refresh'te notifyChange tetiklenmez.
    // Sadece currentFocusedId null'a düştüğünde bir kez daha tetiklenir.
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(500);
    }

    // En sonunda focus null olmuş olmalı (1.0 → 0.0 civarı)
    expect(lastFocused).toBe(null);
    // Toplam notify: 1 (ilk focus) + 1 (focus kayboldu) = 2
    expect(notifyCount).toBeLessThanOrEqual(3);
  });

  it('F2: 50 repeated focusImage on same id emits minimal notifications', () => {
    orchestrator.focusImage('img-A', 1.0);
    const initialNotify = notifyCount;

    // 50 kez tekrar aynı id'ye, skor delta 0.02 (<0.05) → atlanır
    for (let i = 0; i < 50; i++) {
      orchestrator.focusImage('img-A', 1.0);
    }

    // İlk focus + 50 negligible skip → sadece 1 bildirim olmalı
    expect(notifyCount - initialNotify).toBe(0);
  });

  it('F3: within hold window, weak new focus does not steal', () => {
    orchestrator.focusImage('img-A', 1.0);
    expect(lastFocused).toBe('img-A');
    const notifyBefore = notifyCount;

    // Hold window 2500 ms, 1000 ms içinde B skoru 0.78 < bar 0.95
    vi.advanceTimersByTime(1000);
    orchestrator.focusImage('img-B', 0.78);

    expect(lastFocused).toBe('img-A'); // değişmedi
    expect(notifyCount).toBe(notifyBefore); // notify atlandı
  });

  it('F4: within hold window, score >= override bar takes over', () => {
    orchestrator.focusImage('img-A', 1.0);
    vi.advanceTimersByTime(1000);

    // Skor 0.96 > bar 0.95 → devralır
    orchestrator.focusImage('img-B', 0.96);
    expect(lastFocused).toBe('img-B');
  });

  it('F5: after hold window, weak focus is allowed to take over', () => {
    orchestrator.focusImage('img-A', 1.0);
    // 3000 ms sonra hold süresi (2500ms) dolmuş
    vi.advanceTimersByTime(3000);

    // Now B can take over with 0.75 (normally below bar)
    orchestrator.focusImage('img-B', 0.75);
    expect(lastFocused).toBe('img-B');
  });
});
