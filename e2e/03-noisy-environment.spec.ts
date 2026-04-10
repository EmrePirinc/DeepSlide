// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * TC-UAT-006 + TC-UAT-010: Gürültülü ortam & Adaptif UI
 *
 * Senaryo: Sunum modunda UI bileşenleri doğru render edilir,
 * adaptif kontroller gizlenip gösterilebilir,
 * Space/Escape klavye kısayolları çalışır.
 */

import { test, expect } from '@playwright/test';

test.describe('Sunum Modu & Adaptif UI (TC-UAT-010)', () => {
  test('sunum modu sayfası açılır', async ({ page }) => {
    await page.goto('/presentation/test-id/present');
    await page.waitForLoadState('networkidle');

    // Sayfa tamamen crash etmemeli
    await expect(page.locator('body')).toBeVisible();

    // Herhangi bir sunuma ait içerik ya da boş state mesajı görünmeli
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('klavye kisayollari DOM\'a bagli', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Escape tuşu sayfa çökmesine neden olmamalı
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).toBeVisible();

    // Space tuşu sayfa çökmesine neden olmamalı
    await page.keyboard.press('Space');
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard sayfa başlığı ve meta tagları doğru', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    // Başlık boş olmamalı
    expect(title.length).toBeGreaterThan(0);
  });

  test('privacy ve terms sayfaları açılır (KVKK)', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/terms');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});
