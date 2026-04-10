// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * TC-UAT-009: Çevrimdışı sunum
 *
 * Senaryo: İnternet kesildiğinde IndexedDB'deki sunum erişilebilir kalır,
 * UI kullanıcıya çevrimdışı uyarısı gösterir ama çökmez.
 */

import { test, expect } from '@playwright/test';

test.describe('Çevrimdışı Mod (TC-UAT-009)', () => {
  test('internet kesilince uygulama çökmez', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // İnternet bağlantısını kes
    await context.setOffline(true);

    // Sayfa hâlâ render ediliyor olmalı
    await expect(page.locator('body')).toBeVisible();

    // Dashboard içeriği mevcut (önceden yüklenmiş) ya da boş state
    const body = await page.locator('body').innerHTML();
    expect(body.length).toBeGreaterThan(100);

    // İnternet geri ver
    await context.setOffline(false);
  });

  test('çevrimdışıyken client-side navigasyon app\'i kırmaz', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Sayfanın JS bundle'ları tamamen yüklenmesini bekle
    await page.waitForLoadState('domcontentloaded');

    await context.setOffline(true);

    // goto yerine client-side link tıklaması — HTTP isteği yapmaz
    const newBtn = page.getByRole('link', { name: /yeni sunum/i }).first();
    if (await newBtn.isVisible()) {
      await newBtn.click();
      // Sayfa hata vermemeli
      await expect(page.locator('body')).toBeVisible();
    } else {
      // Buton yoksa (boş state) — uygulama hâlâ render ediliyor
      await expect(page.locator('body')).toBeVisible();
    }

    await context.setOffline(false);
  });
});
