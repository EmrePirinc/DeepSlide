import type { Presentation } from '@/types/presentation';

/**
 * Sunumu PDF olarak dışa aktarır.
 * jsPDF ile istemci tarafında PDF oluşturma.
 * TODO: jsPDF bağımlılığı eklendiğinde gerçek implementasyon
 */
export async function exportToPDF(presentation: Presentation): Promise<Blob> {
  // Basit HTML-to-PDF yaklaşımı (jsPDF olmadan çalışır)
  const html = generatePresentationHTML(presentation);

  const blob = new Blob([html], { type: 'text/html' });
  return blob;
}

function generatePresentationHTML(presentation: Presentation): string {
  const imagesHtml = presentation.images
    .map(
      (img) => `
      <div style="page-break-inside: avoid; margin-bottom: 20px; border: 1px solid #eee; padding: 10px; border-radius: 8px;">
        <img src="${img.thumbnailDataUrl}" style="max-width: 200px; border-radius: 4px;" />
        <p style="font-size: 12px; color: #666; margin-top: 4px;">${img.fileName}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px;">
          ${img.keywords
            .map(
              (kw) =>
                `<span style="background: #f0f0f0; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${kw.text}</span>`
            )
            .join('')}
        </div>
      </div>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${presentation.title} - DeepSlide</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { color: #111; }
    .grid { display: grid; grid-template-columns: repeat(${presentation.settings.columnCount}, 1fr); gap: 16px; }
  </style>
</head>
<body>
  <h1>${presentation.title}</h1>
  <p>${presentation.images.length} görsel — DeepSlide ile oluşturuldu</p>
  <hr>
  <div class="grid">${imagesHtml}</div>
</body>
</html>`;
}

/**
 * PDF/HTML dosyasını indirir.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
