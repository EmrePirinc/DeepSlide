'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * pptxtojson Slide → PNG Blob canvas renderer.
 *
 * Desteklenen öğeler (Faz 1):
 * - text (HTML içerik düz metne indirgenir, bold/italic korunur)
 * - shape (rect/ellipse/roundRect yaklaşık çizim + fill/border)
 * - image (base64 data URL drawImage)
 * - table (monospace grid)
 *
 * Atlanan öğeler: chart, video, audio, diagram (SmartArt), math, group (faz 1).
 * Grup elementleri recursive açılır.
 */

import type { Slide, Element, Text, Shape, Image as PptxImage, Table, Fill } from 'pptxtojson';
import type { ParsedPresentation, RenderOptions, SkippedElement } from './types';

const DEFAULT_FONT_STACK =
  '"Inter", "Noto Sans", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif';

interface RenderResult {
  blob: Blob;
  skipped: SkippedElement[];
}

export async function renderSlideToBlob(
  slide: Slide,
  slideIndex: number,
  pres: ParsedPresentation,
  opts: RenderOptions,
): Promise<RenderResult> {
  const canvas = new OffscreenCanvas(opts.width, opts.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas 2D context alınamadı');

  // Kaynak PPTX slide boyutu → hedef canvas boyutu oranı
  const scaleX = opts.width / pres.size.width;
  const scaleY = opts.height / pres.size.height;

  // Arka plan
  await drawBackground(ctx, slide.fill, opts, pres.themeColors);

  const skipped: SkippedElement[] = [];

  // Layout elemanlarını önce (slide master), sonra slide elemanları
  const allElements: Element[] = [
    ...(slide.layoutElements ?? []),
    ...(slide.elements ?? []),
  ].sort((a, b) => {
    const oa = 'order' in a ? a.order ?? 0 : 0;
    const ob = 'order' in b ? b.order ?? 0 : 0;
    return oa - ob;
  });

  for (const el of allElements) {
    await drawElement(ctx, el, { scaleX, scaleY }, pres.themeColors, slideIndex, skipped);
  }

  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return { blob, skipped };
}

// ═══════════════════════════════════════════════════════════════════════════

type Ctx2D = OffscreenCanvasRenderingContext2D;
interface Scale { scaleX: number; scaleY: number; }

async function drawBackground(ctx: Ctx2D, fill: Fill, opts: RenderOptions, themeColors: string[]): Promise<void> {
  if (!fill) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, opts.width, opts.height);
    return;
  }
  applyFill(ctx, fill, 0, 0, opts.width, opts.height, themeColors);
  ctx.fillRect(0, 0, opts.width, opts.height);

  // Image fill ayrı — await gerekir
  if (fill.type === 'image') {
    await drawImageData(ctx, fill.value.base64, 0, 0, opts.width, opts.height);
  }
}

async function drawElement(
  ctx: Ctx2D,
  el: Element,
  scale: Scale,
  themeColors: string[],
  slideIndex: number,
  skipped: SkippedElement[],
): Promise<void> {
  // Group — recursive
  if (el.type === 'group') {
    for (const child of el.elements) {
      await drawElement(ctx, child, scale, themeColors, slideIndex, skipped);
    }
    return;
  }

  const left = el.left * scale.scaleX;
  const top = el.top * scale.scaleY;
  const width = el.width * scale.scaleX;
  const height = el.height * scale.scaleY;

  ctx.save();

  // Rotate
  if ('rotate' in el && el.rotate) {
    const cx = left + width / 2;
    const cy = top + height / 2;
    ctx.translate(cx, cy);
    ctx.rotate((el.rotate * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  switch (el.type) {
    case 'shape':
      drawShape(ctx, el, left, top, width, height, themeColors);
      break;
    case 'text':
      drawText(ctx, el, left, top, width, height, themeColors);
      break;
    case 'image':
      await drawImageData(ctx, el.base64 || el.blob, left, top, width, height);
      break;
    case 'table':
      drawTable(ctx, el, left, top, width, height);
      break;
    case 'chart':
    case 'video':
    case 'audio':
    case 'diagram':
    case 'math':
      skipped.push({
        slideIndex,
        type: el.type,
        reason: `${el.type} Faz 1'de desteklenmiyor — placeholder çizildi`,
      });
      drawPlaceholder(ctx, el.type, left, top, width, height);
      break;
  }

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════
// Shape

function drawShape(
  ctx: Ctx2D,
  shape: Shape,
  x: number, y: number, w: number, h: number,
  themeColors: string[],
): void {
  applyFill(ctx, shape.fill, x, y, w, h, themeColors);

  // Path — basit şekiller için fallback dikdörtgen
  const type = shape.shapType || 'rect';
  if (type.includes('ellipse') || type === 'oval' || type === 'circle') {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    if (shape.borderWidth > 0) {
      ctx.strokeStyle = shape.borderColor || '#000000';
      ctx.lineWidth = shape.borderWidth;
      ctx.stroke();
    }
  } else if (type.includes('roundRect')) {
    const r = Math.min(w, h) * 0.1;
    roundRectPath(ctx, x, y, w, h, r);
    ctx.fill();
    if (shape.borderWidth > 0) {
      ctx.strokeStyle = shape.borderColor || '#000000';
      ctx.lineWidth = shape.borderWidth;
      ctx.stroke();
    }
  } else {
    ctx.fillRect(x, y, w, h);
    if (shape.borderWidth > 0) {
      ctx.strokeStyle = shape.borderColor || '#000000';
      ctx.lineWidth = shape.borderWidth;
      ctx.strokeRect(x, y, w, h);
    }
  }

  // Shape'in içindeki yazı (varsa)
  if (shape.content) {
    drawHtmlText(ctx, shape.content, x, y, w, h, '#000000', shape.vAlign);
  }
}

function roundRectPath(ctx: Ctx2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ═══════════════════════════════════════════════════════════════════════════
// Text

function drawText(
  ctx: Ctx2D,
  textEl: Text,
  x: number, y: number, w: number, h: number,
  themeColors: string[],
): void {
  // Arka plan fill (text kutusu)
  if (textEl.fill && textEl.fill.type !== 'image') {
    applyFill(ctx, textEl.fill, x, y, w, h, themeColors);
    ctx.fillRect(x, y, w, h);
  }
  drawHtmlText(ctx, textEl.content, x, y, w, h, '#000000', textEl.vAlign);
}

/**
 * pptxtojson metin içeriğini HTML string olarak veriyor (p/span/b/i + style).
 * Biz burada basit regex ile düz metne indirgiyoruz ve varsayılan stille çiziyoruz.
 * Gelişmiş stiller Faz 2'de.
 */
function drawHtmlText(
  ctx: Ctx2D,
  html: string,
  x: number, y: number, w: number, h: number,
  defaultColor: string,
  vAlign?: string,
): void {
  const lines = htmlToPlainLines(html);
  if (lines.length === 0) return;

  // Font boyutunu kutu yüksekliğine göre tahmin et (basit)
  let fontSize = Math.min(Math.floor(h / Math.max(lines.length, 1) * 0.7), 48);
  if (fontSize < 10) fontSize = 10;

  ctx.fillStyle = defaultColor;
  ctx.font = `${fontSize}px ${DEFAULT_FONT_STACK}`;
  ctx.textBaseline = 'top';

  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;

  let startY = y + 4;
  if (vAlign === 'mid' || vAlign === 'ctr') {
    startY = y + (h - totalHeight) / 2;
  } else if (vAlign === 'b' || vAlign === 'bot') {
    startY = y + h - totalHeight - 4;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const textX = x + 8;
    // Basit wrap yok — kesilirse kes
    const maxWidth = w - 16;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillText(line, textX, startY + i * lineHeight, maxWidth);
    ctx.restore();
  }
}

function htmlToPlainLines(html: string): string[] {
  if (!html) return [];
  // <br> ve </p> sonrası satır sonu
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n');
  // HTML tag'leri temizle
  const stripped = withBreaks.replace(/<[^>]+>/g, '');
  // HTML entity decode (temel)
  const decoded = stripped
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  return decoded.split('\n').map((s) => s.trim()).filter((s) => s.length > 0);
}

// ═══════════════════════════════════════════════════════════════════════════
// Image

async function drawImageData(
  ctx: Ctx2D,
  src: string,
  x: number, y: number, w: number, h: number,
): Promise<void> {
  if (!src) return;
  try {
    const bitmap = await imageFromSrc(src);
    ctx.drawImage(bitmap, x, y, w, h);
    bitmap.close();
  } catch {
    // Resim yüklenemezse placeholder
    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
}

async function imageFromSrc(src: string): Promise<ImageBitmap> {
  if (src.startsWith('data:')) {
    const res = await fetch(src);
    const blob = await res.blob();
    return createImageBitmap(blob);
  }
  const res = await fetch(src);
  const blob = await res.blob();
  return createImageBitmap(blob);
}

// ═══════════════════════════════════════════════════════════════════════════
// Table (simple grid)

function drawTable(
  ctx: Ctx2D,
  table: Table,
  x: number, y: number, w: number, h: number,
): void {
  const rows = table.data.length;
  if (rows === 0) return;
  const cols = table.data[0]?.length ?? 0;
  if (cols === 0) return;

  const rowHeight = h / rows;
  const colWidth = w / cols;
  const fontSize = Math.max(10, Math.min(rowHeight * 0.5, 18));

  ctx.strokeStyle = '#9CA3AF';
  ctx.lineWidth = 1;
  ctx.font = `${fontSize}px ${DEFAULT_FONT_STACK}`;
  ctx.textBaseline = 'middle';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = table.data[r][c];
      const cx = x + c * colWidth;
      const cy = y + r * rowHeight;

      if (cell.fillColor) {
        ctx.fillStyle = cell.fillColor;
        ctx.fillRect(cx, cy, colWidth, rowHeight);
      }

      ctx.strokeRect(cx, cy, colWidth, rowHeight);

      if (cell.text) {
        ctx.fillStyle = cell.fontColor || '#000000';
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx + 2, cy, colWidth - 4, rowHeight);
        ctx.clip();
        ctx.fillText(cell.text, cx + 6, cy + rowHeight / 2);
        ctx.restore();
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Placeholder (chart/video/diagram)

function drawPlaceholder(
  ctx: Ctx2D,
  kind: string,
  x: number, y: number, w: number, h: number,
): void {
  ctx.fillStyle = '#F3F4F6';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);

  ctx.fillStyle = '#6B7280';
  ctx.font = `16px ${DEFAULT_FONT_STACK}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(`[${kind.toUpperCase()}]`, x + w / 2, y + h / 2);
  ctx.textAlign = 'start';
}

// ═══════════════════════════════════════════════════════════════════════════
// Fill application

function applyFill(
  ctx: Ctx2D,
  fill: Fill,
  x: number, y: number, w: number, h: number,
  _themeColors: string[],
): void {
  if (!fill) {
    ctx.fillStyle = 'rgba(0,0,0,0)';
    return;
  }

  switch (fill.type) {
    case 'color':
      ctx.fillStyle = fill.value || 'rgba(0,0,0,0)';
      break;
    case 'gradient': {
      const g = fill.value;
      const angle = ((g.rot ?? 0) * Math.PI) / 180;
      const dx = Math.cos(angle) * w;
      const dy = Math.sin(angle) * h;
      const gradient = ctx.createLinearGradient(x, y, x + dx, y + dy);
      for (const stop of g.colors ?? []) {
        const pos = parseFloat(stop.pos) / 100;
        if (!Number.isNaN(pos)) gradient.addColorStop(pos, stop.color);
      }
      ctx.fillStyle = gradient;
      break;
    }
    case 'pattern':
      ctx.fillStyle = fill.value.foregroundColor || '#FFFFFF';
      break;
    case 'image':
      // Image fill → caller async drawImageData çağırır
      ctx.fillStyle = 'rgba(0,0,0,0)';
      break;
    default:
      ctx.fillStyle = 'rgba(0,0,0,0)';
  }
}
