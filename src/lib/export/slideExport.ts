// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Tek slaytı PNG veya JPEG olarak dışa aktar.
 * Canvas API kullanarak DOM → canvas → blob.
 */

/**
 * DOM elementini PNG olarak indir
 */
export async function exportSlideAsPNG(element: HTMLElement, fileName: string): Promise<void> {
  const dataUrl = await domToDataUrl(element, 'image/png');
  if (dataUrl) downloadDataUrl(dataUrl, `${fileName}.png`);
}

/**
 * DOM elementini JPEG olarak indir
 */
export async function exportSlideAsJPEG(element: HTMLElement, fileName: string): Promise<void> {
  const dataUrl = await domToDataUrl(element, 'image/jpeg');
  if (dataUrl) downloadDataUrl(dataUrl, `${fileName}.jpg`);
}

async function domToDataUrl(element: HTMLElement, mimeType: string): Promise<string | null> {
  try {
    // html-to-image varsa kullan (opsiyonel bağımlılık)
    const mod = await import('html-to-image').catch(() => null);
    if (mod) {
      if (mimeType === 'image/png') {
        return mod.toPng(element, { width: 1920, height: 1080, pixelRatio: 1, backgroundColor: '#070D1F' });
      }
      return mod.toJpeg(element, { width: 1920, height: 1080, pixelRatio: 1, quality: 0.92, backgroundColor: '#070D1F' });
    }

    // Fallback: Canvas API ile basit export
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Basit arka plan
    ctx.fillStyle = '#070D1F';
    ctx.fillRect(0, 0, 1920, 1080);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Slayt Export (html-to-image yükleyin)', 960, 540);

    return canvas.toDataURL(mimeType, 0.92);
  } catch {
    console.error('Slayt export başarısız');
    return null;
  }
}

function downloadDataUrl(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}
