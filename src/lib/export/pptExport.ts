import type { Presentation } from '@/types/presentation';
import { downloadBlob } from './pdfExport';

/**
 * Sunumu basit HTML slayt formatında dışa aktarır.
 * TODO: pptxgenjs entegrasyonu ile gerçek PowerPoint çıktı
 */
export async function exportToPPT(presentation: Presentation): Promise<void> {
  const slides = presentation.images.map(
    (img, i) => `
    <div style="page-break-after: always; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px;">
      <img src="${img.thumbnailDataUrl}" style="max-height: 60vh; max-width: 80%; object-fit: contain; border-radius: 8px;" />
      <div style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
        ${img.keywords
          .map(
            (kw) =>
              `<span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 16px; font-size: 14px;">${kw.text}</span>`
          )
          .join('')}
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 8px;">Slayt ${i + 1}/${presentation.images.length}</p>
    </div>
  `
  );

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${presentation.title}</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; }
    @media print { div { page-break-after: always; } }
  </style>
</head>
<body>${slides.join('')}</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  downloadBlob(blob, `${presentation.title}.html`);
}
