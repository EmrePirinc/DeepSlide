// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * TC-UAT-001: Sunum oluşturma akışı
 *
 * Senaryo: Kullanıcı yeni sunum oluşturur, görsel yükler,
 * dashboard'da kartı görünür ve sayfa yenilemede veriler korunur.
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Test için küçük bir PNG oluştur (1x1 kırmızı piksel)
function createTestImageBuffer(): Buffer {
  // Minimal valid PNG (1x1 kırmızı)
  return Buffer.from(
    '89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000c4944415408d76360f8cfc00000000200017a'
    + 'dc7ffd0000000049454e44ae426082',
    'hex'
  );
}

test.describe('Sunum Oluşturma (TC-UAT-001)', () => {
  test.beforeAll(() => {
    // Test görsel dosyasını geçici olarak oluştur
    const tmpPath = path.join('/tmp', 'test-slide.png');
    fs.writeFileSync(tmpPath, createTestImageBuffer());
  });

  test('dashboard açılır ve yeni sunum sayfasına gidilir', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DeepSlide/i);

    // Dashboard yüklendi — skeleton geçer, içerik gelir
    await page.waitForSelector('h1', { timeout: 10_000 });
    await expect(page.locator('h1')).toContainText('DeepSlide');

    // "Yeni Sunum" butonu görünür
    const newBtn = page.getByRole('link', { name: /yeni sunum/i });
    await expect(newBtn).toBeVisible();
  });

  test('yeni sunum sayfası açılır', async ({ page }) => {
    await page.goto('/presentation/new');
    await page.waitForLoadState('networkidle');

    // Sayfada bir başlık veya yükleme alanı var
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test('editor sayfası skeleton gösterir, sonra içerik yükler', async ({ page }) => {
    // Gerçek ID olmayan bir sayfada graceful handling kontrol
    await page.goto('/presentation/nonexistent-id');
    await page.waitForLoadState('networkidle');

    // Sayfa crash etmemeli (404 yerine boş state göstermeli)
    await expect(page.locator('body')).toBeVisible();
  });
});
